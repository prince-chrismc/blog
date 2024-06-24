---
image: ./social-preview.png
description: "C++ developers struggling with slow build times can leverage distributed builds to harness the power of multiple machines and significantly reduce wait times. This guide explores two distribution strategies: distributing compilation units for smaller projects and distributing targets for larger ones with complex configurations. Both approaches benefit from caching mechanisms to further optimize builds. By understanding these strategies and choosing the right fit for your project, you can streamline your development workflow, improve scalability, and conquer C++ build times once and for all."
authors: [chris]
tags: [c++, build times, distributed builds, compilation units, targets, caching, performance, development efficiency, scalability, ci/cd, pipelines, local builds]
---

# C++ Distributed Builds: Strategies to Reduce Build Times

Have you ever stared longingly at that *time-consuming* progress bar, willing your C++ project to compile faster? If you're nodding along, you're not alone. The [ISO's annual "lite" developer survey](/2024-survey-results) consistently reveals that over 60% of respondents consider long build times a major pain point, with little improvement year over year.

Thankfully, there's an old solution: [distributing the build](https://cppdepend.com/blog/importance-of-cpp-distributed-build-systems/) burden across multiple machines. This approach can [dramatically slash those wait times](https://devblogs.microsoft.com/engineering-at-microsoft/large-scale-distributed-builds-with-microsoft-build-accelerator/) ([either way you go](https://www.distcc.org/)) and free you to focus on what matters - writing great code. This blog post will explore two prominent distribution techniques and how they've evolved: distributing compilation units and distributing targets. But here's the secret sauce: a [target-based approach](https://enccs.github.io/cmake-workshop/targets/), the current best practice, can not only accelerate builds but also lead you to design cleaner and more maintainable build pipelines. Let's dive in!

## Distributing Makefile Builds: The Predecessor

This strategy leverages [C++'s compilation process](https://stackoverflow.com/questions/6264249/how-does-the-compilation-linking-process-work), this strategy focuses on splitting the build into individual source files (compilation units) and compiling them into object files in parallel. Each machine receives a unit, compiles it independently, and returns the object file. This method is sometimes refered to as a task-based, where the order of the tasks needs to be preserved.

This approach has roots in the historical use of **Makefiles** for parallelizing builds. Makefiles, with their [file-based structure](https://www.gnu.org/software/make/), allowed developers to define separate targets for object, assembled, archived, linked and other build artifact files. By leveraging the `make -j` flag, builds could be spread across multiple cores or machines.

However, Makefiles faced limitations:

* **Limited Dependency Management:** Makefile's rely on explicit dependencies between intermediate compilation artifacts. This becomes cumbersome for complex projects with intricate relationships between [build artifacts](https://firefox-source-docs.mozilla.org/contributing/build/artifact_builds.html) or when implementing extra processing like [sanitizers](/2024/06/03/sast-without-slow).
* **Scalability Challenges:** Managing distributed builds across multiple machines with Makefiles can be complex, demanding careful coordination of build order, resource allocation, and error handling as the build environment grows. There's a few commercial products, like [dmake](https://docs.oracle.com/cd/E19422-01/819-3697/dmake.html) or [emake](https://docs.cloudbees.com/docs/cloudbees-build-acceleration/latest/emake-user-guide/) that implemented this strategy - none of them are really used anymore.

Both of these combine to limit the ability to perform incremental builds. This will cost all the developers to rebuild or "cold build" more often. As all the task need to be re-ran in the same order dividing the a sub graph pulls is more difficult.

Makefile's language of "targets" referred to [compilation targets](https://makefiletutorial.com/#makefile-syntax) for instance going from a `.c` to a `.o` creating a dependency that could be tracked for a single linked target. These compilation unit themselves could be distributed with other strategies.

## Distributing Compilation Units: Still Relevant?

Despite the challenges with distributing tasks within Makefile, distributing compilation units can still be relevant for a variety of projects with few targets but could still benefit from [incremental builds](https://en.wikipedia.org/wiki/Incremental_build_model). Here are some tools that implement this strategy:

* **Distcc (Distributed C/C++ Compiler):** A free, open-source tool that replaces the system compiler and distributes compilation tasks across a network. You can [manage this with IaC](https://developers.redhat.com/blog/2019/05/15/2-tips-to-make-your-c-projects-compile-3-times-faster#tip__2__using_a_distcc_server_container). There are [other similar implementations](https://engineering.celonis.com/blog/homcc-a-traffic-efficient-distributed-compiler/) though less mature or actively developed.
* **IncrediBuild:** A commercial solution offering advanced features like dependency management and caching. Easy out of the box support for cross-platform development.

A crucial element for reducing redundant compilations is caching previously compiled object files based on the source code, compiler flags, and header versions. If a unit hasn't changed, the cached object file can be reused, significantly accelerating the build process. A very popular approach is [combining it with ccache](https://blog.zaleos.net/giving-ccache-distcc-a-spin/) which has been [deployed for a long while](https://www.jamessjackson.com/gcc/ccache/distcc/compiling/c++/2017/07/25/ccache-and-distcc/). these two tools are intended to be used at the compiler level, they can be drop in replacements that wrap the compiler. This ability can be very useful to combine with other other distribution models.

## Modern Tools and Target Distribution: A Powerful Partnership

Modern build tools like [Bazel](https://bazel.build/basics/artifact-based-builds) address the challenges seen with distributing Makefile builds by emphasizing the **target-level dependencies**. This is the current best practice, this [recent talk by CMake](https://schedule.cppnow.org/session/2024/the-importance-of-the-build-system-target-model/) does a great job presenting this. Each target (library, executable, etc.) explicitly declares its dependencies on other targets. This allows the build system to intelligently determine the optimal build order and efficiently distribute tasks across machines. It's worth noting Bazel language for target's is artifacts, which  much more closely aligns with DevOps' principal for [artifact management](https://instatus.com/blog/devops-artifacts).

Here's how Bazel, handles target-level dependencies:

1. **Target Definition:** Each target is defined as a build artifact within a `.bzl` file (Bazel's build language).
2. **Dependency Declaration:** Targets explicitly declare their dependencies on other targets using functions like `cc_library.deps` and `cc_binary.deps`.
3. **Dependency Resolution:** Bazel analyzes the dependency graph formed by all targets and their dependencies.
4. **Parallel Execution:** Based on the dependency graph, Bazel identifies independent tasks that can be executed in parallel across available machines.

With a sample project, simply running `bazel build json_formatter` which correct order the targets and leverage all the resources in the local system.

```python
# Define the application binary
cc_binary(
  name = "json_formatter",
  srcs = ["json_formatter.cpp"],
  deps = [
    # Dependencies for JSON parsing and formatting
    "@com_github_nlohmann_json//:json",  # nlohmann_json library
  ],
)

# Download nlohmann_json as an external repository
http_archive(
  name = "com_github_nlohmann_json",
  urls = ["https://github.com/nlohmann/json/archive/v3.11.2.tar.gz"],
  sha256 = "0e498fea8a781f7eafc11b9a8efa9b7e28d8fb7e774c0c5a5e30fc4eda309a9e4",
  strip_prefix = "json-3.11.2",
  build_file = "@com_github_nlohmann_json//:BUILD",
)
```

Bazel, like other popular C++ build systems, do not include [remote build execution](https://bazel.build/remote/rules#toolchain-rules) (at least for C++). Remote Build Execution (RBE) Is popular option from Google's [BuildBuddy RBE](https://www.buildbuddy.io/docs/rbe-setup/). RBE requires a separate server setup and worker machines. An open-source alternative is [BuildGrid's buildbox](https://gitlab.com/BuildGrid/buildbox/buildbox), though it's far more difficult to find information.

**Benefits of Target-Level Dependencies:**

* **Improved Maintainability:** Explicit dependency declarations make build logic easier to understand and maintain.
* **Scalability:** Bazel manages the complexity of distributed builds, allowing for efficient scaling to large build environments. Just remark is does not handle the infrastructure to run the builds on, you'll need to bring your own.
* **Reduced Build Times:** Parallel execution significantly reduces overall build times, especially for large projects where incremental and partial builds represent smaller sections.

Bazel and similar tools can cache not only object files but also entire build outputs for specific targets. If a target's dependencies haven't changed, the [cached output can be reused](https://bazel.build/basics/distributed-builds#remote_caching), eliminating the need to rebuild the entire target from scratch.

## Cruciality of Caching in Both Strategies

Both distributing compilation units and distributing targets benefit significantly from effective caching mechanisms.

* **Compilation Unit Distribution:** Caching eliminates redundant compilations.  If a unit hasn't changed since the last build, the cached object file can be reused, regardless of which machine it was built on previously. This significantly speeds up subsequent builds, especially for large projects with many shared units.
* **Target Distribution:** Caching can [store entire target outputs](https://scons.org/doc/production/HTML/scons-user/ch22.html), not just object files. This is particularly valuable for distributing targets because:
  * **Incremental Builds:** When a target's dependencies haven't changed, the cached output can be used directly, avoiding the need to rebuild the entire target from scratch. This is especially beneficial for large or complex targets with many dependencies.
  * **Remote Builds:** When downloading pre-built cached artifacts from a remote server, build times are significantly [reduced compared to transferring and rebuilding](https://forum.gitlab.com/t/making-long-build-times-short-by-using-cache/12540/2) everything from scratch. This is crucial for scaling builds across geographically distributed environments.

Both distribution strategies benefit from caching by reducing redundant work. This frees up machines to focus on building new or changed parts of the project, leading to more efficient resource utilization. These concept extend to local builds, where you can leverage [Bazel's remote caching](https://bazel.build/remote/caching) capabilities. Configure a local cache using `--remote_cache` to store build artifacts and potentially avoid redundant compilations. Package managers are another [implementation of a caching](https://learn.microsoft.com/en-us/vcpkg/users/binarycaching) strategy. Stay tunned for more topic.

## Choosing the Right Strategy

The best approach is using **both strategies**. If you need to pick one distributing compilation units can be simpler for smaller projects with well-defined dependencies and few target platforms. Distributing targets tend be more efficient for larger projects with complex build configurations when incremental builds have the most potential.

Here's a decision-making framework to help you choose the right strategy.

* Start with distributing targets
  * This will encourage you to [write smaller more reusable components](https://softwareengineering.stackexchange.com/a/405228). Caching a library is less complex then compilation object files.
  * It's easier to leverage package managers to handle the encapsulation and dependents management. This often have built-in tools to determine what needs to be rebuilt.
  * This is have the most immediate impact on overall build times. Downloading prebuilt cached artifacts and only performing incremental builds for local development.

This might not translate to all projects types. So for the other side of the spectrum, if you have a monorepo where source files are shared across multiple projects, then distributing the compilation would most likely have the larger impact upfront.

## Conclusion

Distributing C++ builds offers a powerful tool to improve development efficiency. By leveraging these strategies and available tools, you can significantly reduce build times and streamline your C++ development workflow. Remember to consider your project's specific needs when choosing the best approach for your build distribution.

You'll know you've done it right when [testing is the longest](https://blog.gradle.org/general-build-distribution) portion of you pipeline.
