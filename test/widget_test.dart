import 'package:flutter_test/flutter_test.dart';

import 'package:cat_app/main.dart';

void main() {
  testWidgets('shows clicker buttons and opens lizards clicker', (tester) async {
    await tester.pumpWidget(const CatApp());

    expect(find.text('Mice Clicker'), findsOneWidget);
    expect(find.text('Bugs Clicker'), findsOneWidget);
    expect(find.text('Lizards Clicker'), findsOneWidget);

    await tester.tap(find.text('Lizards Clicker'));
    await tester.pumpAndSettle();

    expect(find.text('Lizard clicks: 0'), findsOneWidget);
    expect(find.text('Click Lizard'), findsOneWidget);
  });
}
