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
            FilledButton.icon(
              icon: const Icon(Icons.mouse),
              label: const Text('Mice Clicker'),
              onPressed: _openMiceClicker,
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
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Mice Clicker'),
        actions: [
          IconButton(
            tooltip: 'Close',
            icon: const Icon(Icons.close),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
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
