---
slug: simple-ci-with-presets
image: ./social-preview.png
title: "Optimizing CI Build Scripts and Enhancing Developer Experience with CMake Presets"
description: "Explore the power of CMake presets in DevOps as we dive into optimizing CI pipelines and simplifying build scripts for efficient software development. Learn how SOLID design principles are applied to enhance developer experience and streamline workflows. Discover practical insights into CMake toolchains, presets, and build scripts, and gain valuable tips for cross-platform development. Elevate your software configuration with expert guidance on managing multiple build environments effortlessly. Join us on this journey of code optimization and discover how CMake presets can significantly improve your programming workflow. Stay ahead in the world of continuous integration and gain insights into IDE integrations, making your development process smoother. Uncover the secrets of C++ build systems and enhance your knowledge of best practices in software development. Ready to revolutionize your CI pipelines? Dive into this comprehensive guide and boost your skills in building robust and efficient software projects with CMake presets."
authors: [chris]
tags: [c++, devops, cmake, ci, continuous integration, build scripts, toolchains, ci pipelines, c++ build systems]
---

Managing build scripts, especially in C++, can be a [daunting task](https://julienjorge.medium.com/an-overview-of-build-systems-mostly-for-c-projects-ac9931494444) for development teams. CMake, with its powerful toolkit, offers a solution to this challenge. In this blog, we'll delve into the world of CMake presets and explore how they can significantly reduce CI build script complexity, leading to a more efficient and enjoyable development experience.

## The Challenge of Build Scripts in C++

C++ teams often struggle with an extensive list of build systems, introducing layers of complexity. CMake, when mastered, becomes a game-changer. This blog focuses on CMake's key pillars: toolchains, presets, and build scripts. Understanding their roles and interactions is crucial for achieving a streamlined developer experience and unambiguous CI workflows.

Join us on a journey where we'll:

- Empower developers with effortless configuration and cross-platform builds.
- Simplify CI pipelines for efficient testing.
- Elevate project maintainability and collaboration across diverse environments.

<!-- truncate -->

## Applying SOLID Design Principles to Build Scripts

In this blog, we'll apply [SOLID](https://en.wikipedia.org/wiki/SOLID) design principles to our build scripts, focusing on the distinction between tool configurations, global project settings, and target-specific options. This effective design allows for supporting multiple build environments without the need to change `CMakeLists.txt` for each of them.

While new tools like XMake are promising, the blog predominantly focuses on CMake, given its prevalence in over 85% of development teams. For those starting new projects under research and development efforts, exploring alternative options like Meson is recommended.

## Three Layers of CMake

Understanding the distinction between toolchains, presets, and build scripts is vital. Let's break down these three layers:

1. **[Toolchain](https://cmake.org/cmake/help/book/mastering-cmake/chapter/Cross%20Compiling%20With%20CMake.html#toolchain-files):**
   - Purpose: Provide information about the build system, including compiler paths, library locations, and dependencies.
   - When to use: Cross-compiling, using a specific compiler or tool-set, employing custom build systems or dependency management tools.
   - How to use: Create a toolchain file (e.g., `my_toolchain.cmake`) and pass it to CMake using presets.

2. **[Presets](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html):**
   - Purpose: Encapsulate common configuration options, build flags, generator choices, and toolchain settings for easy reuse and sharing.
   - When to use: Managing multiple build configurations, streamlining workflows, integrating with IDEs and build systems.
   - How to use: Create a `CMakePresets.json` or `CMakeUserPresets.json` file, define presets, and use the `--preset` option with CMake commands.

3. **[Build Scripts](https://www.jetbrains.com/help/clion/cmakelists-txt-file.html):**
   - Purpose: Define the project's structure, targets, dependencies, and build rules using CMake's language.
   - When to use: Creating a CMake project for multi-platform builds, organizing sources, setting compile flags, and defining custom build steps.
   - How to use: Write `CMakeLists.txt` files in your project's root and subdirectories.

## Organizing CMake Presets for Effective CI Pipelines

### CMake Toolchains

With a single responsibility, toolchains focus on compiler and tool setup for specific environments. They are essential for cross-compilation and non-standard tool setups.

**Example for Cross-Compiling:**

```yaml
build:
    matrix:
        toolchains:
        - my_toolchain_arm.cmake
        - my_toolchain_x86.cmake
    run: |
        cmake --preset release -DCMAKE_TOOLCHAIN_FILE="${{ matrix.toolchain }}"
        cmake --build --preset release
    uses: upload-artifacts@v4
    with:
        name: ${{ matrix.toolchain }}
        paths: build/release
```

**Example for Supporting Multiple Compilers:**

```yaml
build:
    matrix:
        compiler:
        - { "c": "gcc-7", "cxx": "g++-7" }
        - { "c": "gcc-11", "cxx": "g++-11" }
        - { "c": "gcc-12", "cxx": "g++-12" }
    run: |
        cmake --preset test \
            -DCMAKE_C_COMPILER="${{ matrix.compiler.c }}"
            -DCMAKE_CXX_COMPILER="${{ matrix.compiler.cxx }}"
        cmake --build --preset test
        cmake --build --target unit_tests_run --preset test
```

It's entirely possible to define a preset for each configuration. This however posses significant challenges when configurations need to change over time or when downstream consumers desire different configurations. A reasonable compromise would be to make toolchain specific presets `hidden: true` to prevent their misuse.

### Organizing Presets

Effective organization of presets enhances manageability and scalability. Follow a structured approach to organizing presets for different scenarios.

**Example Preset Organization:**

```txt
.
├── cmake/
│   └── CMakePresets.json
├── include
├── src
├── examples/
│   └── CMakePresets.json
├── tests/
│   └── CMakePresets.json
├── CMakePresets.json
└── CMakeUserPresets.json
```

It's import to keep presets open for extension, but closed for modification. You should not be be redefine or overriding values.

- **Root `CMakePresets.json`:** Define baseline configurations for consuming or developing the project.
- **`cmake/` Directory Presets:** Include presets for the entire project.
- **`examples/` and `tests/` Directory Presets:** Include presets specific to those targets.

:::note

This concept also extends to monorepos, each sub component could define it's own set of presets that are aggregates but the root presets. Simply substitute in `core/` and `driver/` or `error/` and `math/` to match your use case.

:::

**Including other `CMakePresets.json`:**

```json
{
    "version": 6,
    "cmakeMinimumRequired": {
        "major": 3,
        "minor": 25,
        "patch": 0
    },
    "include": [
      "example/CMakePresets.json",
      "tests/CMakePresets.json"
    ],
    "configurePresets": [ /* ... */ ],
    "buildPresets": [ /* ... */ ]
}
```

Presets should not be forced to depend upon configurations that they do not use.

### Defining Presets

Most of the preparation needs to happen in configure presets. It's important to also create build preset with the same name.

**`cmake/CMakePresets.json`:**

Define simple unobtrusive presets that can be inherited for more specialized. By setting a configuration preset to define the build folder, you will not need to call `mkdir` and you can reuse the preset name to access artifacts.

```json
{
    "name": "release",
    "configuration": "Release",
    "binaryDir": "${sourceDir}/build/${presetName}"
}
```

**`tests/CMakePresets.json`:**

Declare configurations that produce unique binaries with a narrow focus. Passing in all the global compiler flags and define the required environment variables for either configure or build.

```json
{
  "name": "asan",
  "inherits": "debug",
  "cacheVariables": {
      "CMAKE_CXX_FLAGS": "..." // Global compiler files needed by all targets for complete results
  },
  "environment": {
      "ASAN_OPTIONS": "..." // Configure EVN_VAR required to active more checks
  }
}
```

### Refactoring CI Pipelines

Refactor CI pipelines to leverage the simplicity and power of CMake presets.

**Example CI Pipeline for Release:**

Remove the hassle of having the correct working directory.

```yaml
build:
    run: |
        cmake --preset release
        cmake --build --preset release
    uses: upload-artifacts@v4
    with:
        paths: build/release
```

**Example CI Pipeline for ASAN (AddressSanitizer):**

Setup custom "run" targets to launch tests with the correct environment variables to ensure consistency without polluting the workspace.

```yaml
build:
    run: |
        cmake --preset asan
        cmake --build --preset asan
        cmake --build --target unit_tests_run --preset test 
```

### Accommodating All Developers

Flexibility is crucial. Allow developers room to work efficiently while ensuring a green production environment. Use `CMakeUserPresets.json` for user-specific configurations.

**Example User-Specific Preset (`CMakeUserPresets.json`):**

```json
{
  "name": "clang",
  "inherits": "debug",
  "generator": "Ninja",
  "cacheVariables": {
      "CMAKE_C_COMPILER": "clang-16",
      "CMAKE_CXX_COMPILER": "clang++-16",
      "CMAKE_CXX_STANDARD": 23,
      "CMAKE_CXX_CLANG_TIDY": "clang-tidy-16;fix"
  }
}
```

**Example Platform Specific Preset:**

```json
{
    "name": "ccache-linux",
    "hidden": true,
    "cacheVariables": {
        "CMAKE_C_COMPILER_LAUNCHER": "/usr/bin/ccache",
        "CMAKE_CXX_COMPILER_LAUNCHER": "/usr/bin/ccache"
    },
    "condition": {
        "type": "equals",
        "lhs": "${hostSystemName}",
        "rhs": "Linux"
    }
},
{
    "name": "ccache-darwin",
    "hidden": true,
    "cacheVariables": {
        "CMAKE_C_COMPILER_LAUNCHER": "$env{HOMEBREW_PREFIX}/opt/ccache",
        "CMAKE_CXX_COMPILER_LAUNCHER": "$env{HOMEBREW_PREFIX}/opt/ccache"
    },
    "condition": {
        "type": "equals",
        "lhs": "${hostSystemName}",
        "rhs": "Darwin"
    }
}
```

## Conclusion

- Toolchains focus on compiler and tool setup for specific environments.
- Presets provide reusable configuration sets for different build scenarios.
- Build scripts define the project's structure and build rules using CMake commands.
- Use toolchains for cross-compilation and non-standard tool setups.
- Use presets for managing multiple build configurations and sharing settings.
- Use build scripts to define the project's build structure and rules.

### Further Reading

Explore other opinions and insights on CMake presets:

- [CMake Presets - A Fresh Start](https://martin-fieber.de/blog/cmake-presets/)
- [CMake Presets Best Practices](https://dominikberner.ch/cmake-presets-best-practices/)
- [Simplify Your C++ Development Environment using CMakePresets.json](https://mgibson.ca/posts/simplify-your-c-development-environment-using-cmakepresets-json/)
- [How to Use CMake Without the Agonizing Pain (Part 2)](https://alexreinking.com/blog/how-to-use-cmake-without-the-agonizing-pain-part-2.html)
- [Professional CMake, 16th Edition](https://crascit.com/professional-cmake/)

Explore IDE integrations and their support for CMake presets:

- [CMake Presets vs. CMakeSettings.json in Visual Studio](https://learn.microsoft.com/en-us/cpp/build/cmake-presets-vs?view=msvc-170)
- [CMake Presets in CLion](https://www.jetbrains.com/help/clion/cmake-presets.html)
- [CMake Presets in Qt Creator](https://www.qt.io/blog/qt-creator-9-cmakepresets)
- [CMake Presets in Visual Studio Code](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/cmake-presets.md)

Are you ready to optimize your CI pipelines and enhance your development workflow with CMake presets? Let the journey begin!
