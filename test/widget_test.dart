import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:cat_app/main.dart';

void main() {
  testWidgets('increments counter when button is tapped', (tester) async {
    await tester.pumpWidget(const CatApp());

    expect(find.text('Taps: 0'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.touch_app));
    await tester.pump();

    expect(find.text('Taps: 1'), findsOneWidget);
  });
}
