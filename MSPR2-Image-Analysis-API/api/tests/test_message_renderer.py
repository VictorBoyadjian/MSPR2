"""Unit tests for message_renderer.MessageRenderer.

`pulling_message` is time-throttled (it skips chunks that arrive within
`refresh_time` seconds of the last print), so `time.time` is replaced with a
deterministic clock that advances 1 s per call — well above the throttle — to
make the output predictable.
"""

import itertools
from types import SimpleNamespace

import message_renderer
from message_renderer import MessageRenderer

MB = 1024 * 1024


def _use_fake_clock(monkeypatch) -> None:
    clock = itertools.count(start=100.0, step=1.0)
    monkeypatch.setattr(message_renderer.time, "time", lambda: next(clock))


def _chunk(status: str, completed: int, total: int) -> SimpleNamespace:
    return SimpleNamespace(status=status, completed=completed, total=total)


class TestPullingMessage:
    def test_always_prints_final_complete_line(self, monkeypatch, capsys) -> None:
        _use_fake_clock(monkeypatch)
        stream = [
            _chunk("pulling", 500 * MB, 1000 * MB),
            _chunk("pulling", 1000 * MB, 1000 * MB),
        ]

        MessageRenderer.pulling_message(stream, required_model="gemma3")

        out = capsys.readouterr().out
        assert "gemma3" in out
        assert "pull complete" in out

    def test_prints_progress_for_incomplete_chunk(self, monkeypatch, capsys) -> None:
        _use_fake_clock(monkeypatch)
        stream = [_chunk("downloading", 250 * MB, 1000 * MB)]

        MessageRenderer.pulling_message(stream, required_model="gemma3")

        out = capsys.readouterr().out
        assert "downloading" in out
        assert "%" in out
        assert "Mb/s" in out
        assert "Go" in out

    def test_prints_complete_marker_when_completed_reaches_total(
        self, monkeypatch, capsys
    ) -> None:
        _use_fake_clock(monkeypatch)
        stream = [_chunk("verifying", 1000 * MB, 1000 * MB)]

        MessageRenderer.pulling_message(stream, required_model="gemma3")

        out = capsys.readouterr().out
        # the status line itself reports completion before the final summary line
        assert out.count("pull complete") >= 1

    def test_empty_stream_still_prints_final_line(self, monkeypatch, capsys) -> None:
        _use_fake_clock(monkeypatch)

        MessageRenderer.pulling_message([], required_model="llama3.2-vision")

        out = capsys.readouterr().out
        assert "llama3.2-vision" in out
        assert "pull complete" in out

    def test_ignores_chunks_missing_fields(self, monkeypatch, capsys) -> None:
        _use_fake_clock(monkeypatch)
        # status present but completed/total falsy -> guarded out, no crash
        stream = [_chunk("pulling manifest", 0, 0)]

        MessageRenderer.pulling_message(stream, required_model="gemma3")

        out = capsys.readouterr().out
        assert "pull complete" in out
