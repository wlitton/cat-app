import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:cat_app/main.dart';

void main() {
  testWidgets('navigates from load screen to mice screen', (tester) async {
    await tester.pumpWidget(const CatApp());

    expect(find.text('Choose a screen to explore'), findsOneWidget);
    expect(find.text('Go to Mice Screen'), findsOneWidget);

    await tester.tap(find.text('Go to Mice Screen'));
    await tester.pumpAndSettle();

    expect(find.text('Mice Screen'), findsOneWidget);
    expect(find.text('Welcome to the mice screen!'), findsOneWidget);
  });
}
