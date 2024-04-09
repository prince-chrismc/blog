---
slug: pkg-mngr-vs-repro-builds
image: ./social-preview.png
title: "Package Management vs. Reproducible Builds... Or Complementary Approaches?"
description: "Discover the synergy between package management and reproducible builds in C++ development. Learn how these seemingly opposing forces can actually complement each other, leading to a streamlined and efficient workflow. Explore the definitions, required traits, and exiting tool pairs, along with key takeaways for ensuring identical binaries from identical source code and environments. Find out how to leverage both approaches for enhanced control, compatibility, and productivity in your development projects."
authors: [chris]
tags: [package management, reproducible builds, development workflow, conan, bazel, nix, vcpkg, nuget, conda, nix, nixpkgs, buck2, toolchains, build systems, dependency management, deterministic builds, pre-built libraries, build optimization, hermetic builds, embedded systems]
---

Let's face it, in the land of C++ development, package management and reproducible builds can feel like oil and water. Package managers promise lightning-fast builds with pre-built libraries, while reproducible builds preach control and consistency by rebuilding everything. But here's the thing: **they're not sworn enemies.**

Think of it this way.

Let's start with the basic build system. Imagine you're spending hours compiling your code. You throw more cores at the problem, and the build time shrinks – but there's a limit. Eventually, adding more cores won't magically make it compile any faster. Now imagine you don't build at all. Poof! Your build time is divided by zero, because it's not happening at all, it's just not a factor anymore. **The most reproducible builds are the ones you don't have to repeat endlessly.**  That's where package management comes in, saving you from endless build marathons. Yet there's even more benefits for reproducibility as well.

This post will explore how these two seemingly opposing forces can actually work together to create a **streamlined and efficient development workflow**. Despite being a new idea, there is evidence of this already being used along with potential new opportunities for future development in this space.

<!--truncate-->

## Definitions

This is important because you probably have a different one. Most teams actually have a very weak or loose definition for both of these terms.

[Reproducible builds](https://reproducible-builds.org/docs/definition/):
> A build is reproducible if given the same source code, build environment and build instructions, any party can recreate bit-by-bit identical copies of all specified artifacts.

It's reproducible if anyone else can verify it. That's a pretty tall order, but seems like the [rebuild it a few times](https://reproducible-builds.org/docs/rebuilders/) is the low hanging fruit. Most teams are not reaching this level of reproducibility, regardless it's the standard.

[Package Manager](https://en.wikipedia.org/wiki/Package_manager):
> A package management system is a collection of software tools that automates the process of installing, upgrading, configuring, and removing [...] distributions of software and data in archive files. Designed to eliminate the need for manual installs and updates to ensure the authenticity and integrity of the package. Putting packages in the correct locations in your project and writing the code to include the package(s) in your project. [[ref]](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Package_management#what_exactly_is_a_package_manager)

The definition for a "package manager" has evolved, the expectation for what it should do and provide has grown as [SDLC](https://aws.amazon.com/what-is/sdlc/) has matured as a topic. A package manager _must_ provision a unique isolated environment (i.e. automatically pull in _only_ necessary the dependencies). This is the best practice across ecosystems take [Python and it's virtual environments](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/) which are now the recommendation.

## Leveraging Both Approaches

The key to a successful workflow lies in understanding the strengths of each approach and using them together. Here's how:

### Package Management: The Power of Pre-built Libraries

Package managers like Nuget, Conan, and Conda offer a compelling advantage: pre-built libraries. These tools save developers countless hours by eliminating the need to local build dependencies from source. A notable way this is achieved is by large well tested repositories which often provide abstractions to the project specific inputs that often existing. This translates to faster development cycles and a more streamlined workflow. However, package management can introduce challenges.

The importance of these packages is they are re-usable, typically any [changes to the output contents](https://conda.io/projects/conda/en/latest/user-guide/concepts/pkg-specs.html) will be labeled, this makes the need of tracking individual variations of source code take less precedency. The output or package of one project is often the input for another. This is a powerful abstraction when aiming for reproducible builds as it can simplify the integration of third-party dependencies which likely do not conform the [commandments](https://reproducible-builds.org/docs/commandments/).

### Reproducible Builds: Determinism and Control

Reproducible builds prioritize [control and consistency](https://go.dev/blog/rebuild). By building _everything_ from source with a defined set of tools, developers ensure that the build process is deterministic. This means that the same source code will always produce the same binary, given the same environment. Faster more trust worthy builds and test results ensure developers are focused and [boost productivity](https://www.atlassian.com/blog/productivity/context-switching) [[ref]](https://asana.com/resources/context-switching).

The downside of reproducible builds is the complexity they can introduce. Manually managing dependencies and build systems can be time-consuming and error-prone. Often teams can not rely on the standard build tools, for examples, Rust's compiler, `rustc`, has support for this but that has not been added to `Cargo` [[ref]](https://github.com/rust-secure-code/wg/issues/28) the main build system for that ecosystem. This ends up becoming a burden with trying to make the build reproducible when incorporating third-party dependencies. If external build systems are not directly supported by the reproducible build system then you are likely to lose control of the inputs and settings. The lack of insight to the source build graph also reduce the effectiveness of the [build tree shaking](https://webpack.js.org/guides/tree-shaking/) and [caching strategies](https://sluongng.hashnode.dev/bazel-caching-explained-pt-1-how-bazel-works) less efficient. To close out the pain point the outputs of dependencies can be project specific and require extensive manual work to be integrated back into the reproducible system.

## Required Traits

In order to ensure easy of use, build systems overwhelming will allow you to pull in system libraries. This loose rule makes it very easy to break the [hermetic](https://bazel.build/basics/hermeticity) build ideal required to be reproducible; resulting with a non-reproducible environment. This problems are beautifully outlined in a talk by [Andreas Herrmann](https://www.linkedin.com/in/andreas-herrmann-2081751ba) titled [Fast, correct, reproducible builds with Nix + Bazel](https://youtu.be/2wI5J8XYxM8?t=943). The challenge of doing this is also outline in [Buck2](https://buck2.build/docs/concepts/build_rule/#package-boundaries-and-access-to-source-files) so it's quiet general.

Using a build system that offers distributions and correct [dependency set](https://bazel.build/reference/glossary#depset) and [incremental builds](https://bazel.build/reference/glossary#incremental-build) while a package managers strictness with toolchain management and control over third-party dependencies is the winning combination. Additionally package managers which offer distribution of compiled artifacts rather then local caching can _correctly_ reduce the number for build branches. To round off the shopping list, not only should the package manager provide an isolated environment, the build system should also enforce this by isolating the build tree's filesystem (i.e not have default search paths).

1. **Utilize Package Managers for Controlling Toolchains:** The number one advantage of using a package manager is the large community driven repositories which have generally been tested against a large list of toolchains. The build instructions are typically well controlled already as these tool setup for handling the variations in the build scripts. They can handle all the complex mapping of different inputs to each individual flavor of build scripts. This generally makes the integration more streamlined.

2. **Build Critical Third-Party Dependencies:** When dealing with critical project dependencies or those with specific version requirements, consider building them from source. This gives you greater control over the build process and ensures compatibility. Being able to resolve more complex graphs to get the best version when managing dependencies is critical. As they all support building from source you will be able to ensure all the impacted make targets are tracked.

3. **Handling Heterogenous Developer Environments:** It's very likely on larger distributed teams, individual will have different variations are be slightly skewed in terms of the operating system they use and the supported environments. This requires a high-order tool that is able to understand the current system configuration and provide the correct binaries. Using a package manager to control and provision the exact build environment and dependencies will reduce this by creating the dedicated sandbox required.

## Existing Tool Pairs

When exploring integration possibilities between package managers and reproducibility focused build systems in the realm of C++ development, Conan stands out as a supportive tool. Conan not only [supports Bazel](https://docs.conan.io/2/examples/tools/google/bazeltoolchain/build_simple_bazel_project.html#examples-tools-bazel-toolchain-build-simple-bazel-project), but also offers advanced features such as build graphs and toolchain combinations, so you can very likely achieve this with other build systems as well. However, it's worth noting that Conan does support for [build tools](https://docs.conan.io/2/reference/tools/google/bazeldeps.html#build-context-activated), it [lacks direct integration](https://github.com/conan-io/conan/blob/06297af6798f26b38717773aab5752a1158aa04c/conan/tools/google/toolchain.py#L7) with Bazel's [user-defined toolchains](https://bazel.build/tutorials/ccp-toolchain-config) through it's `compiler_executables` configuration, a feature that is support with it's CMake Presets.

On the other hand, Vcpkg, another prominent package manager, is primarily tailored for CMake, limiting its compatibility with other build systems. This has led [some developers to resort to manual configurations](https://igormcoelho.medium.com/building-cross-platform-c-gmp-library-with-vcpkg-cmake-and-bazel-lessons-learned-ea2cba4b697d), effectively hardcoding dependencies into Bazel build files for each package. Despite efforts to bridge this gap, Bazel still [faces challenges in accommodating](https://blog.envoyproxy.io/external-c-dependency-management-in-bazel-dd37477422f5) various C++ package managers, with Nix and Conan emerging as the preferred choices due to their _existing_ support. The limited interoperability between [other build systems](https://bazelbuild.github.io/rules_foreign_cc/main/index.html) exists if you are curious.

Switching gears, within the embedded space, Yocto presents a compelling case with its BitBake package manager. Yocto's support for [reproducible builds](https://docs.yoctoproject.org/test-manual/reproducible-builds.html) has contributed to its success, offering a reliable solution for managing dependencies and ensuring consistent build outputs. Unfortunately this is not seen in other application specific segments of the ecosystem.

## Conclusion

The integration of package management and reproducible builds in C++ development presents a nuanced landscape where both approaches, although initially seem contradictory, can harmonize to enhance development workflows. Package managers like Nix or Conan offer the advantage of tightly controlled libraries and environments, reducing development cycles needed to create robust hermetic build environments. Complementary to this, reproducible builds prioritize control and consistency by rebuilding everything, ensuring deterministic outputs and boosting productivity through more efficient optimization that can be made with these constraints.

Despite the challenges each approach presents, the key lies in understanding their respective strengths and leveraging them together effectively. Utilizing package managers for controlling toolchains and handling critical third-party dependencies can enhance build processes, while reproducible builds offer deeper control and insight into build outputs.

**Key Takeaways:**

- **Package managers** streamline development with pre-built libraries and provide deterministic builds by leveraging pre-configured toolchains. Ensure control and compatibility with normalized build inputs/outputs for more efficient build graph shaking.
- **Reproducible Build Systems** offer deeper per project build tree shaking by caching intermediate build artifacts. Having better visibility on incremental changes between builds offers better build times and more insights to potential problems.

Together they guarantee identical binaries from identical source code and environments, aiding ensure correct secure software.
