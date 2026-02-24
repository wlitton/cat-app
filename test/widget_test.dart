import 'package:flutter_test/flutter_test.dart';

import 'package:cat_app/main.dart';

void main() {
  testWidgets('shows clicker buttons and opens bugs clicker', (tester) async {
    await tester.pumpWidget(const CatApp());

    expect(find.text('Mice Clicker'), findsOneWidget);
    expect(find.text('Bugs Clicker'), findsOneWidget);

    await tester.tap(find.text('Bugs Clicker'));
    await tester.pumpAndSettle();

    expect(find.text('Ladybug clicks: 0'), findsOneWidget);
    expect(find.text('Click Ladybug'), findsOneWidget);
  });
}
