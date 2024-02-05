---
slug: build-more-configurations
image: ./social-preview.png
title: "Unlock Efficiency & Innovation in C++ Development: Building More Configuration than You Ship"
description: >
  Struggling to keep up with evolving C++ tools and features while maintaining existing code? Feeling stuck with limited access to new capabilities? You're not alone! This blog unveils a powerful solution: building more configurations in your CI pipelines.

  Discover how this DevOps approach can:
  * Boost productivity: Unleash the potential of new features and tools.
  * Ensure project longevity: Guarantee compatibility across platforms and versions.
  * Improve code quality: Catch issues early through comprehensive testing.
  * Embrace innovation: Break down barriers to adopting new C++ advancements.

  Learn by example:
  * We'll explore how Go's backward compatibility inspires similar practices in C++.
  * See practical techniques for testing with multiple compilers, standards, and platforms.
  * Get guided steps to implement this approach in your CI pipeline.
  
  Don't miss out on:
  * Valuable tips to get started easily.
  * Real-world examples showcasing successful adoption.
  * Actionable steps to share your experiences and contribute to the C++ community!
  
  Ready to revolutionize your C++ development workflow? Start now!
authors: [chris]
tags: [c++, ci, continuous integration, build configurations, devops, efficiency, innovation, code quality, compatibility, golang, compilers, cmake, github actions]
---

In the steadily evolving landscape of C++, where incremental improvements shape the tools we use, it can quickly become a challenge to stay up to date with the latest technologies while still supporting the code already in production. If you're apart of the [61% of C++ developers](https://www.jetbrains.com/lp/devecosystem-2023/cpp/), the concept of building more configurations might initially seem counterintuitive. However, it's precisely under such circumstances that this approach serves as a solution to the challenge of limited access to new features and tools within the C++ ecosystem.

By prioritizing testing a comprehensive list of configuration during CI, your team can unleash access to new features and tools, boosting productivity and ensuring project longevity and compatibility in a competitive landscape by [establishing guardrails](https://www.techtarget.com/searchitoperations/tip/Putting-up-DevOps-guardrails-what-does-that-mean) for the project.

Let's delve deeper into the compelling reasons why this DevOps approach, centered around building more configurations, deserves widespread adoption in C++ environments.

<!-- truncate -->

## The simplicity of building more

As with C++, the Golang's runtime is backwards compatibility. Older binaries typically run seamlessly on newer Go versions without recompilation. This helped establish the best practice of thoroughly testing applications with multiple Go versions. In CI pipelines, running automated tests against [multiple Go versions](https://github.com/actions/setup-go?tab=readme-ov-file#matrix-testing) looks something like this:

```yml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        go: [ '1.21', '1.20', '1.19' ]
    name: build (go-${{ matrix.go }})
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go }}
      - run: go build app.go
```

The key concept to note is the `strategy`, pun intended, which has the `matrix`, a declarative list, of Golang versions to test against. Go's approach can inspire similar practices in C++. All the popular CI services offer this feature (just with unique names).

At a high level, it's easy to think of this as a `template<typename version> class` where multiple instance of the job are instantiated each with a different version but perform the same algorithm and can be parallelized.

## Tackling C++ Configurations

The best strategy to identify the "version matrix" is looking at the platforms your project already supports. At a minimum that should be your LTS, production (latest release), and current build tools. This will help ensure any changes introduced will be compatible across the board. Building and testing the product with a newer toolchain will help build confidence with business stake holders as operation risk will be reduced.

### Testing with more compilers

The unified tool set behind Go is amazing, however competition is healthy and drives innovation for end-users. Let's do something similar to go version but try it with C++ compilers and language standards.

```yaml
    strategy:
      matrix:
        compiler: [g++-12, clang-15]  # Specify compiler versions to test
        cxxstd: [17, 23]  # Specify the language standard to test
```

You can the configure you build system normally.

```yaml
    steps:
      - run: cmake --preset release \
              -DCMAKE_CXX_COMPILER=${{ matrix.compiler }} \
              -CMAKE_CXX_STANDARD=${{ matrix.cxxstd }}
```

The full workflow is over on [Gist](https://gist.github.com/prince-chrismc/224bbc3ba583012fd3b6ffef8976ab10#file-compilers-yml). It's a great idea to apply this idea to [sanitizer presets](./simple-ci-with-presets).

### Ensuring cross-platform compatibility

And there is no reason for this to not be cross-platform. Though for GitHub Actions, this is a little bit more involved since not all the C++ build environments are installed.

This should give you a good idea how you can tailor a `strategy.matrix` to your specific needs.

```yaml
  test:
    runs-on: ${{ matrix.os }}  # Use dynamic runner based on OS
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest, macos-latest]
        compiler: [gcc-11, clang-14]
        include:
          -  os: windows-latest
             compiler: gcc-11
             # Add extra fields to `choco install mingw-w64-x86_64-gcc-11``
             name: mingw-w64
             version: 11.2.0
          - os: windows-latest
            # Override `clang-14` to use the MSVC provided clang
            compiler: cl-clang
          - os: macos-latest
            compiler: gcc-11
            # Add extra fields to `brew install` the correct version
            package: gcc@11
```

The full workflow can be viewed as a [Gist](https://gist.github.com/prince-chrismc/224bbc3ba583012fd3b6ffef8976ab10#file-cross-platform-yml).

## Conclusion

Incorporate these principles into your CI practices! Here's a few steps to get you started

* Identify the toolchains you are using to build you software.
* Refactor you pipeline to isolate those changes and create a matrix with those preliminary configurations.
* Once you've stabilized the builds, you are ready to introduce more configurations with updated toolchains to build.

Designing a flexible CI pipeline with a variety of configurations breaks down barriers to adding new compilers. Staying up-to-date is essential for efficient software development, and comprehensive configuration testing ensures code quality, performance, and security from the outset.
