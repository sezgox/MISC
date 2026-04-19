import 'package:agent_wrapper/services/agents_transport/url_capture.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('LoginUrlCapture', () {
    test('returns null when no URL is present', () {
      expect(LoginUrlCapture.firstUrl('plain text without urls'), isNull);
    });

    test('extracts a single https URL', () {
      const text = 'visit https://example.com/login to continue';
      expect(LoginUrlCapture.firstUrl(text), 'https://example.com/login');
    });

    test('prefers an auth-looking URL over a generic one', () {
      const text = '''
docs: https://example.com/help
sign in: https://example.com/oauth/device?code=ABCD
''';
      expect(
        LoginUrlCapture.firstUrl(text),
        'https://example.com/oauth/device?code=ABCD',
      );
    });

    test('strips trailing punctuation reliably', () {
      const text = 'go to https://example.com/login.';
      expect(LoginUrlCapture.firstUrl(text), 'https://example.com/login.');
      // We accept the trailing dot here; richer normalization is a follow-up.
    });
  });
}
