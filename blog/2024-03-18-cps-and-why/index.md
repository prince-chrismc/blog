---
slug: cps-and-why
image: ./social-preview.png
description: "C++ developers have long struggled with package management and battling cryptic build systems. The Common Package Specification (CPS) aims to be a game-changer, offering a standardized way to describe dependencies. But is it a silver bullet or an overly ambitious proposal? This blog explores CPS, its potential benefits, and the questions it raises."
authors: [chris]
tags: [C++, Common Package Specification, CPS, dependency management, build systems, package managers, standardization, flexibility]
unlisted: true
---

# CPS: A Streamlined Future for C++ or Overly Specific?

The most relevant [problems for C++ developers](https://isocpp.org/files/papers/CppDevSurvey-2023-summary.pdf) are package management, setting up CI/CD pipelines, and maintaining build scripts. Talking to developers and builds teams the cause of that frustration is the lack of interoperability between build systems.

The [Common Package Specification](https://cps-org.github.io/cps/index.html) (CPS) aims to revolutionize C++ development by standardizing how dependencies are described. While the core concept holds promise, specific aspects raise questions about its practicality within the C++ ecosystem.

<!--truncate-->

This leads to the **Call to Actions**. What do you think is a "package"? Headers, Libs, DLLs are pretty obvious. What about Compiler flags? What does Multi-Config mean to you? Is a package valid if it produces [ODR](https://en.cppreference.com/w/cpp/language/definition) violations or does leads to [ill-formed programs](https://wiki.sei.cmu.edu/confluence/display/cplusplus/AA.+Bibliography#AA.Bibliography-ISO/IEC14882-2014)? Share you ideas and thoughts.

## The Dependency Labyrinth

C++ developers are no strangers to dependency woes. Different build systems have their own cryptic ways of handling external libraries, leading to compatibility nightmares and endless versioning headaches. These inconsistencies often culminate in cryptic build errors, leaving developers frustrated and wasting valuable time.

What ever we do it needs to be unanimous for all of us which is a tall order. The best approach is going to be an extensible format but we need to get the core right. So let's focus on those fields.

## The Universal Translator

CPS proposes a standardized format for describing C++ libraries, including:

* **Package Name and Version:** Clear identification of the library and version.
* **Dependency Information:** Explicit listing of all required dependencies.
* **Compiler Flags and Features:** Standardized instructions for integrating the library into a C++ project, regardless of the build system.

A minimal CPS focused on core information:

```json
{
  "Cps-Version": "0.9",
  "Name": "sample",
  "Description": "Sample CPS for a static library",
  "License": "BSD",
  "Version": "1.2.0",
  "Default-Components": [ "sample" ],
  "Components": {
    "sample": {
      "Type": "archive",
      "Requires": [ "libfoo:core" ],
      "Compile-Features": "c++17",
      "Definitions": [ "SAMPLE" ],
      "Includes": [ "@prefix@/include" ],
      "Location": "@prefix@/lib/libsample.a"
    }
  }
}
```

You can checkout the [CPS' example](https://cps-org.github.io/cps/sample.html) for a more complete interpretation.

## Benefits for C++ Developers

Widespread adoption by C++ build systems and package managers could offer advantages:

* **Simplified Package Management:** A universal approach eliminates build system-specific  translation layers and duplicated effort by developers.
* **Reduced Build Errors:** Consistent dependency information across projects could minimizes errors caused by multiple installations with version conflicts, missing libraries, link order, or compiler flags.
* **Farewell to the Dependency Hunt:** Build systems could deterministically locate packages dependencies based on the CPS specification provided by other build systems or package managers.
* **Simplified Project Evolution:**  Easier switching between build systems and package managers as project needs evolve, fostering innovation within the C++ ecosystem.

## A Question of Specificity: Focusing on Core Functionalities

The existence of many [build systems](https://julienjorge.medium.com/an-overview-of-build-systems-mostly-for-c-projects-ac9931494444) (or [these](https://hackingcpp.com/cpp/tools/build_systems.html)) and [package managers](./pkg-mngr-roundup) for C++ reflects the
diversity of project requirements. The challenge for CPS lies in defining a core set of functionalities that caters to the widest range of projects while remaining flexible enough to accommodate those with specific needs.

The inclusion of overly specific fields like JVM vendors and GLIBC runtime versions raises concerns:

* [C Runtime Vendor](https://cps-org.github.io/cps/schema.html#c-runtime-vendor) and [C++ Runtime Vendor](https://cps-org.github.io/cps/schema.html#cpp-runtime-vendor): Use case exists, but most developers don't target various flavors.
* [.NET](https://cps-org.github.io/cps/schema.html#clr-vendor) and [JVM](https://cps-org.github.io/cps/schema.html#jvm-vendor): Only relevant to a subset of C++ developers.
* [Compat-Version](https://cps-org.github.io/cps/schema.html#compat-version): Little agreement on software versioning. Without a set format, this field will be tool-specific.
* [Warnings and Errors](https://cps-org.github.io/cps/features.html#nowarn): Consumer decisions, shouldn't be forced downstream. Has no impact on binaries packaged.

The focus should be on fields all C++ developers use. These specific fields can be saved in a technical recommendation for future work. The specification should allow adding them later.

### Reasonable Default Dependencies

A common issue with third-party dependencies is including more parts than necessary. A common example is providing a header-only variant and a compiled library in the same installation. This is the example for [`"Default-Components"`](https://cps-org.github.io/cps/schema.html#default-components) in the [CppCon 2023 talk](#additional-resources). Providing multiple copies of symbols such static and shared result in linker errors and will be error-prone.

Ideally, users shouldn't need to micromanage individual components within a dependency. Including all components by default ensures a well-formed and functional package must be provided by the project. This eliminates the need to specify every piece and reduces the chance of missing something crucial.

* **Proposed Solution: Granular Component Control**

The specification does need to allow for granular control over components. An optional `"Excluded-Components"` field could be introduced, allowing authors to specify parts that are not need during the build process (e.g., executables or experimental additions). This approach balances providing all necessary components for most users while offering flexibility for advanced users to optimize dependency usage.

* **Challenge: Feature-Driven Dependencies**

Current CPS doesn't handle feature-driven projects well. Build options can change a component's functionality and binary compatibility without altering its name, include directories or complier flags. This makes it difficult to specify exactly which features you need when using a dependency.

### Configuration Dependent Inconsistency

There are some fields that require a bit more complexity, [compiler flags](https://cps-org.github.io/cps/schema.html#compile-flags) and [linker flags](https://cps-org.github.io/cps/schema.html#link-flags) are unfortunately platform specific. Currently there is no complete example for having different compiler flags for the the various implementation, however [nowarn](https://cps-org.github.io/cps/features.html#nowarn) does give a hit to this problem.

* **Potential Solution: Define the Compiler and Flags under platform**

```json
{
  // ...
  "Platform": {
    "Kernel": "linux",
    "Compiler": "gcc",
    "Compiler-Flags": ["-finline-functions-called-once"] // An unreasonable flag to force on downstream consumers?
  },
  // ...
}
```

This is a very open topic, perhaps the CPS is only one configuration since the binary library would not be portable? However the current proposal's example is for an x86_64-Linux which could be used by either Clang or GCC and might (incorrectly) have incompatible flags. The header-only case, where the package and CPS should be re-usable cross operating-systems does not allow describing both MSVC `/bigobj` and GCC `-mbig-obj` might be cause to have different CPS with one package.

## The Road Ahead: A Balancing Act for Success

For CPS to succeed within the C++ ecosystem, it needs to strike a delicate balance:

* **Standardization for Efficiency:** A core set of standardized fields for essential dependency information.
* **Flexibility for Innovation:** Adaptable to accommodate diverse project needs and avoid hindering alternative solutions.
* **Developer Adoption:** Widespread adoption by C++ build systems like CMake and Meson in addition from package managers such as Conan and Vcpkg is essential for the impact of CPS to be realized.

## Conclusion: A Promising Path with Open Questions

CPS holds immense potential to streamline C++ dependency management, but questions remain regarding its specific details.  If the community can ensure the right level of flexibility and focus on core functionalities, with enough feedback and input, CPS has the potential to be a valuable tool.  However, only time and developer adoption will tell if CPS becomes the universal language for C++ dependencies, or remains an ambitious proposal with unanswered questions.

### Additional Resources

* CppCon 2023 Talks:
  * [Libraries: A First Step Toward Standard C++ Dependency Management](https://www.youtube.com/playlist?list=PLHTh1InhhwT6c2JNtUiJkaH8YRqzhU7Ag)
    * [Brett Brown AMA](https://www.reddit.com/r/cpp/comments/171mtjk/libraries_a_first_step_toward_standard_c/)
  * [A Common Package Specification: Getting Build Tools to Talk to Each Other](https://www.youtube.com/watch?v=ZTjG8fy6Bek)

* [Cargo's Package Metadata](https://doc.rust-lang.org/cargo/commands/cargo-metadata.html)
* [Conada Package Metadata format](https://conda.io/projects/conda-build/en/latest/resources/package-spec.html#package-metadata)

* [Similar functionality in Maven](https://maven.apache.org/archetype/maven-archetype-plugin/specification/archetype-metadata.html)
