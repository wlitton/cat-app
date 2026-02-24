import 'package:flutter/material.dart';

void main() {
  runApp(const CatApp());
}

class CatApp extends StatelessWidget {
  const CatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cat App',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  static const Color _miceScreenBackground = Color(0xFFE8F4FF);
  int _tapCount = 0;

  void _increment() {
    setState(() {
      _tapCount++;
    });
  }

  void _openMiceClicker() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const MiceClickerScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cat App Home'),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.pets, size: 96),
            const SizedBox(height: 16),
            Text(
              'Home screen',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Taps: $_tapCount',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.touch_app),
              label: const Text('Increment'),
              onPressed: _increment,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: 280,
              height: 120,
              child: FilledButton(
                onPressed: _openMiceClicker,
                style: FilledButton.styleFrom(
                  padding: EdgeInsets.zero,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Ink(
                  decoration: BoxDecoration(
                    color: _miceScreenBackground,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      Align(
                        alignment: Alignment.topCenter,
                        child: Opacity(
                          opacity: 0.22,
                          child: Padding(
                            padding: const EdgeInsets.only(top: 18),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Icon(Icons.mouse, size: 36),
                                SizedBox(width: 20),
                                Icon(Icons.mouse, size: 36),
                                SizedBox(width: 20),
                                Icon(Icons.mouse, size: 36),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const Center(
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.mouse),
                            SizedBox(width: 8),
                            Text('Mice Clicker'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MiceClickerScreen extends StatefulWidget {
  const MiceClickerScreen({super.key});

  @override
  State<MiceClickerScreen> createState() => _MiceClickerScreenState();
}

class _MiceClickerScreenState extends State<MiceClickerScreen> {
  int _miceClicks = 0;

  void _incrementMiceClicks() {
    setState(() {
      _miceClicks++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _HomePageState._miceScreenBackground,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.mouse, size: 96),
            const SizedBox(height: 16),
            Text(
              'Mouse clicks: $_miceClicks',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.ads_click),
              label: const Text('Click Mouse'),
              onPressed: _incrementMiceClicks,
            ),
          ],
        ),
      ),
    );
  }
}
