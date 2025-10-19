# prompts used with  spec driven developement approach

1 - first prompt for constitution generation:

```bash
/speckit.constitution Create principles focused on designing a single page application, focus on user experience,modern look and feel and performance. Minimize dependencies, don't implement test.
```

2 - Create the specification prompt:

```bash
/speckit.specify build an application to simulate mass-spring systems. The app needs to display a spring hanging from a ceiling with a weight attached at its end. Users must be able to set parameters for the mass's weight, the spring's initial length, and its stiffness (or spring constant). The applicaiton will display 2 buttons, one to start the simulation, one to reste it. Once the user clicks on "Start simulation" button, the application should simulate the spring's oscillation. the application have also to display graphs: one for velocity (m/s), one for acceleration (m/s^2), one for total energy (J) and one for displacement (m).
```

3- Clarify underspecified areas (optional):

```bash
/speckit.clarify
```

4 - Create technical implementation plans with your chosen tech stack

```bash
/speckit.plan  Use React, Vite and Typescript for the frontend framework, D3.js for graphing, and tailwind css for styling. The application should be a single-page app (SPA) that runs entirely in the browser without any backend services. Focus on performance optimization techniques suitable for SPAs.
```

5 - Generate actionable task lists for implementation

```bash
/speckit.tasks 
```

6 - Cross-artifact consistency & coverage analysis

```bash
/speckit.analyze 
```

7 - Execute all tasks to build the feature according to the plan

```bash
/speckit.implement 
```
