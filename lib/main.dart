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
  static const Color _bugsScreenBackground = Color(0xFFFFF3E0);
  static const Color _lizardsScreenBackground = Color(0xFFE8F8EC);
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

  void _openBugsClicker() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const LadybugsClickerScreen()),
    );
  }

  void _openLizardsClicker() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const LizardsClickerScreen()),
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
            Wrap(
              alignment: WrapAlignment.center,
              spacing: 12,
              runSpacing: 12,
              children: [
                _ClickerButton(
                  width: 200,
                  height: 120,
                  backgroundColor: _miceScreenBackground,
                  icon: Icons.mouse,
                  label: 'Mice Clicker',
                  onPressed: _openMiceClicker,
                ),
                _ClickerButton(
                  width: 200,
                  height: 120,
                  backgroundColor: _bugsScreenBackground,
                  icon: Icons.bug_report,
                  label: 'Bugs Clicker',
                  onPressed: _openBugsClicker,
                ),
                _ClickerButton(
                  width: 200,
                  height: 120,
                  backgroundColor: _lizardsScreenBackground,
                  icon: Icons.pets,
                  label: 'Lizards Clicker',
                  onPressed: _openLizardsClicker,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ClickerButton extends StatelessWidget {
  const _ClickerButton({
    required this.width,
    required this.height,
    required this.backgroundColor,
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final double width;
  final double height;
  final Color backgroundColor;
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Ink(
          decoration: BoxDecoration(
            color: backgroundColor,
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
                      children: [
                        Icon(icon, size: 36),
                        const SizedBox(width: 20),
                        Icon(icon, size: 36),
                        const SizedBox(width: 20),
                        Icon(icon, size: 36),
                      ],
                    ),
                  ),
                ),
              ),
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon),
                    const SizedBox(width: 8),
                    Text(label),
                  ],
                ),
              ),
            ],
          ),
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

class LadybugsClickerScreen extends StatefulWidget {
  const LadybugsClickerScreen({super.key});

  @override
  State<LadybugsClickerScreen> createState() => _LadybugsClickerScreenState();
}

class _LadybugsClickerScreenState extends State<LadybugsClickerScreen> {
  int _ladybugClicks = 0;

  void _incrementLadybugClicks() {
    setState(() {
      _ladybugClicks++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _HomePageState._bugsScreenBackground,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.bug_report, size: 96),
            const SizedBox(height: 16),
            Text(
              'Ladybug clicks: $_ladybugClicks',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.ads_click),
              label: const Text('Click Ladybug'),
              onPressed: _incrementLadybugClicks,
            ),
          ],
        ),
      ),
    );
  }
}

class LizardsClickerScreen extends StatefulWidget {
  const LizardsClickerScreen({super.key});

  @override
  State<LizardsClickerScreen> createState() => _LizardsClickerScreenState();
}

class _LizardsClickerScreenState extends State<LizardsClickerScreen> {
  int _lizardClicks = 0;

  void _incrementLizardClicks() {
    setState(() {
      _lizardClicks++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _HomePageState._lizardsScreenBackground,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.pets, size: 96),
            const SizedBox(height: 16),
            Text(
              'Lizard clicks: $_lizardClicks',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.ads_click),
              label: const Text('Click Lizard'),
              onPressed: _incrementLizardClicks,
            ),
          ],
        ),
      ),
    );
  }
}
