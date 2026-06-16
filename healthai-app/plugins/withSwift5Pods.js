const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Force Swift 5 language mode on every CocoaPods target.
//
// Expo 56 opts some of its own Swift packages (expo-modules-core, etc.) into
// Swift 6 language mode, but that code does not pass Swift 6 strict-concurrency
// checks under Xcode 26 — release archives fail with "main actor-isolated ..."
// errors. Swift 5 mode turns those hard errors back into warnings.
//
// This runs during `expo prebuild`, so it survives native regeneration both
// locally and on CI (Codemagic), where ios/ is gitignored and rebuilt.
const MARKER = '[withSwift5Pods]';
const SNIPPET = `
    # ${MARKER} Force Swift 5 language mode on all pods (Xcode 26 / Swift 6 workaround).
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_VERSION'] = '5.0'
      end
    end
`;

module.exports = function withSwift5Pods(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      if (!contents.includes(MARKER)) {
        if (/post_install do \|installer\|\n/.test(contents)) {
          contents = contents.replace(
            /post_install do \|installer\|\n/,
            (match) => match + SNIPPET
          );
        } else {
          // No post_install block yet: add one inside the main target.
          contents = contents.replace(
            /^end\s*$/m,
            `  post_install do |installer|\n${SNIPPET}  end\nend\n`
          );
        }
        fs.writeFileSync(podfilePath, contents);
      }
      return cfg;
    },
  ]);
};
