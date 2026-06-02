import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Facing = 'user' | 'environment';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>('environment');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera requires HTTPS. Open this page over https:// (e.g. expo start --tunnel).');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError(null);
      } catch {
        setError('We need your permission to show the camera');
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, [facing]);

  function toggleCameraFacing() {
    setFacing(current => (current === 'environment' ? 'user' : 'environment'));
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{error}</Text>
        <Button onPress={() => setFacing(f => f)} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={styles.camera as any}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: 300,
    width: 250,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
