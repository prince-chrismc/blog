---
slug: testing-cmake-install
image: ./social-preview.png
title: Automated Testing for Seamless CMake Config File Integration
description: "Struggling with user frustration caused by missing headers or library path woes during C++ library integration?  This comprehensive guide offers a powerful solution: automated testing of your CMake config files using a Behavior-Driven Development (BDD) approach on GitHub Actions.  Imagine a world where users seamlessly integrate your library without any roadblocks – that's the power of this testing strategy.

Not only does automated testing ensure smoother integration, it also eliminates the need for slower, header-only libraries that can lead to ballooned build times due to a bottlenecked pre-processing stage.  By implementing these tests, you'll not only be creating a more user-friendly library, but you'll also be contributing valuable testing expertise to the open-source community.  This guide dives deep, equipping you with the knowledge to tackle both core testing essentials and explore advanced techniques for a truly robust testing suite.  The path to a well-received, high-quality C++ library starts with mastering the art of CMake config file testing – and this guide is your roadmap to success"
authors: [chris]
tags: [c++, cmake, configuration files, bdd, testing, github actions, open source]
---

As a C++ developer, ensuring your library integrates flawlessly with other projects is crucial for driving adoption. [CMake being the defacto standard](/2024-survey-results) plays a vital role in this process by providing installed configuration files; guiding consumers on how to find and utilize your library using [`find_package`](https://cmake.org/cmake/help/latest/command/find_package.html). But how do you guarantee these config files are installed correctly and provide all the necessary information? Enter automated testing!

This blog post explores an approach for testing CMake config files inspired by [Behavioral Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development) practices and showcases a powerful implementation on [GitHub Actions](https://github.com/features/actions) featuring 14+ test cases.

## Why Test CMake Config Files?

Imagine creating a fantastic C++ library, only to have users encounter missing headers or library paths when they attempt to integrate it within their builds. This very real headache is why many open-source developers have [opted for header-only libraries](https://github.com/search?q=repo%3Aconan-io%2Fconan-center-index+package_type+%22header-library%22&type=code).  "Just copying the headers" eventually became the norm. However, this trend has culminated in ballooned build times, as the [preprocessing stage can become a bottleneck](https://devtalk.blender.org/t/speed-up-c-compilation/30508).

<!--truncate-->

The code required to activate this CMake feature is verbose and complex. A prime example is the well-known [cmake-init](https://github.com/friendlyanon/cmake-init) project, which includes the [`install-rules.cmake`](https://github.com/friendlyanon/cmake-init/blob/40c63e4/cmake-init/templates/common/cmake/install-rules.cmake) file. This file clearly demonstrates the significant amount of [boilerplate code](https://en.wikipedia.org/wiki/Boilerplate_code) present.

This complexity arises from the need to cover many use cases. Ideally, most users expect a seamless experience "out of the box" without needing to provide any input. However, a global system install isn't a viable long-term strategy, and advanced users will expect custom installation locations to function correctly. Additionally, package managers like [Conan](https://docs.conan.io/2.0/reference/tools/cmake/cmake.html#conan.tools.cmake.cmake.CMake.install) and [Vcpkg](https://learn.microsoft.com/en-us/vcpkg/maintainers/functions/vcpkg_cmake_install) rely on this same mechanism to capture the output. All these scenarios become even more intricate due to CMake's [lengthy list of default search path](https://cmake.org/cmake/help/latest/command/find_package.html#config-mode-search-procedure) that can be further extended by providing hints, both at the command line and from the consumer's build scripts.

Testing the installed CMake config files helps prevent such headaches by guaranteeing:

* **Correct Installation:** Verifies the config files are placed in the expected locations based on the chosen installation prefix.
* **Complete Configuration:** Ensures the config files provide all essential information for users, including header locations, libraries, defines, and dependencies.
* **Broad Compatibility:** Confirms the library is correctly detected and loaded across different operating systems and architectures.

 Before we can automate the testing, we need to setup the installation scripts first.

### Installing CMake Targets

The foremost expert on this subject is likely Craig Scott, author of [_Professional CMake: A Practical Guide_](https://crascit.com/professional-cmake/). His book includes two very relevant sections: **Chapter 33: Finding Things**, which covers using `find_package`, and **Chapter 34: Installing**. This refers to the [sixteenth edition](https://crascit.com/professional-cmake/release-notes/16th-edition/) of the book; later editions include improvements with topics like C++20 Modules.

The minimal example presented, is very similar to this:

```cmake title="/CMakeLists.txt"
include(GNUInstallDirs)
include(CMakePackageConfigHelpers)
configure_package_config_file(
   MyProjConfig.cmake.in MyProjConfig.cmake
   INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProj
   NO_SET_AND_CHECK_MACRO
   NO_CHECK_REQUIRED_COMPONENTS_MACRO
)
install(FILES ${CMAKE_CURRENT_BINARY_DIR}/MyProjConfig.cmake
   DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/MyProj
   COMPONENT ...
)
```

Alternatively, check the [CMake documentation's example](https://cmake.org/cmake/help/latest/module/CMakePackageConfigHelpers.html#example-generating-package-files) for the same segment of code.

However, this approach does not include exporting namespaced targets or ensuring version compatibility, both of which are highly recommended practices. For a more comprehensive example, we can revisit the cmake-init project. It offers an [example repository](https://github.com/friendlyanon/cmake-init-shared-static) for a shared library. This sample project provides a more complete view of the generated [install rules](https://github.com/friendlyanon/cmake-init-shared-static/blob/d0f853f/cmake/install-rules.cmake) (which required some _trimming_ for this article).

The installation process typically involves two key files:

* The `install-config.cmake` file typically includes another file, `${project}Targets.cmake`, which contains the details about the library's [public and interface properties](https://discourse.cmake.org/t/clarification-on-public-private-with-target-source-group/7845/2). Public properties define aspects of the library visible to users, while interface properties facilitate internal communication between targets within the library.

```cmake title="/cmake/install-config.cmake"
include("${CMAKE_CURRENT_LIST_DIR}/sharedTargets.cmake")
```

* The `install-config.cmake` file dictates how the configuration files are generated and installed. It specifies the destination for the generated files and which library targets should be included in the installation process. While we won't delve into the specifics of this file here, skimming its contents can give you a general understanding of the configuration involved.

```cmake title="/cmake/install-rules.cmake"
include(CMakePackageConfigHelpers)
include(GNUInstallDirs)

# find_package(<package>) call for consumers to find this project
set(package shared)

install(
    DIRECTORY
    include/
    "${PROJECT_BINARY_DIR}/export/"
    DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}"
    COMPONENT shared
)

install(
    TARGETS shared_shared
    EXPORT sharedTargets
    INCLUDES DESTINATION "${CMAKE_INSTALL_INCLUDEDIR}"
)

write_basic_package_version_file(
    "${package}ConfigVersion.cmake"
    COMPATIBILITY SameMajorVersion
)

# Allow package maintainers to freely override the path for the configs
set(
    shared_INSTALL_CMAKEDIR "${CMAKE_INSTALL_LIBDIR}/cmake/${package}"
    CACHE STRING "CMake package config location relative to the install prefix"
)
set_property(CACHE shared_INSTALL_CMAKEDIR PROPERTY TYPE PATH)
mark_as_advanced(shared_INSTALL_CMAKEDIR)

install(
    FILES cmake/install-config.cmake
    DESTINATION "${shared_INSTALL_CMAKEDIR}"
    RENAME "${package}Config.cmake"
    COMPONENT shared
)

install(
    FILES "${PROJECT_BINARY_DIR}/${package}ConfigVersion.cmake"
    DESTINATION "${shared_INSTALL_CMAKEDIR}"
    COMPONENT shared
)

install(
    EXPORT sharedTargets
    NAMESPACE shared::
    DESTINATION "${shared_INSTALL_CMAKEDIR}"
    COMPONENT shared
)
```

Again this example does not have optional features or dependencies that are required or optionally supported. We'll take a look at a more complex `install-config.cmake` equivalent.

## Demystifying the `config.cmake.in` File

Let's delve into a real `.cmake.in` (or `install-config.cmake` to reference the `cmake-init` terminology), this comes from [Thalhammer/jwt-cpp](https://github.com/Thalhammer/jwt-cpp) which will serves as the more complicated example which has support for both optional and interchangeable dependencies.

:::info Feel Free to Contribute

If you have ideas on how to improve on this formula, don't hesitate to contribute to the project.

:::

It should be very easy to see the jump in complexity from `cmake-init`'s one liner configuration file.

```cmake title='/cmake/jwt-cpp.cmake.in'
@PACKAGE_INIT@

set(JWT_EXTERNAL_PICOJSON @JWT_EXTERNAL_PICOJSON@)
set(JWT_SSL_LIBRARY @JWT_SSL_LIBRARY@)

include(CMakeFindDependencyMacro)
if(${JWT_SSL_LIBRARY} MATCHES "wolfSSL")
  find_dependency(PkgConfig REQUIRED)
  pkg_check_modules(wolfssl REQUIRED IMPORTED_TARGET wolfssl)
  list(TRANSFORM wolfssl_INCLUDE_DIRS APPEND "/wolfssl") # This is required for OpenSSL compatibility
else()
  find_dependency(${JWT_SSL_LIBRARY} REQUIRED)
endif()

if(JWT_EXTERNAL_PICOJSON)
  find_dependency(picojson REQUIRED)
endif()

include("${CMAKE_CURRENT_LIST_DIR}/jwt-cpp-targets.cmake")
```

The behavioral requirement is to preserve the options specified when the consumer configured the project so they do not need to be repeated downstream.

### Key Elements Which Need to Be Tested

* **@PACKAGE_INIT@ Replacement:** When configure_package_config_file is used, it replaces `@PACKAGE_INIT@` with a block of code that sets up variables with a PACKAGE_ prefix based on values defined earlier in the script. This ensures relative paths within the installed config file are adjusted based on the installation location.
* **Placeholders (`@JWT_EXTERNAL_PICOJSON@`, `@JWT_SSL_LIBRARY@`):** These placeholders are replaced with actual values during the install process, allowing for customization based on user configuration. These value will be captured in the generate `config.cmake` files.
* **Dependency Management:** The script conditionally finds dependencies based on the library chosen for SSL (`JWT_SSL_LIBRARY`) and whether an external `picojson` library is used (`JWT_EXTERNAL_PICOJSON`).
  * **wolfSSL Handling:** For wolfSSL, the script leverages `PkgConfig` and additionally modifies the include search path to access the OpenSSL compatibility API.
* **Target Inclusion:** The final line includes another script (`jwt-cpp-targets.cmake`) that defines the actual library targets exposed to consumers through `find_package`. This targets file is generated by CMake on install and include the namespace, include directories, link libraries and other properties set to the install or public interface of the target.
* **Optional Features:** Handled else where, some of the features are tracked with the targets themselves changing which files are installed and what preprocessor set set on the public target.

## Summary of Use Cases

There's a lot that might happen when `find_package(jwt-cpp CONFIG REQUIRED)` is called so let's unpack them:

1. **Default Install**: This is the basic `cmake --preset release && cmake --install build/` where none of the options are modified.
2. **Custom Location**: This builds on the previous example by changing the [`CMAKE_INSTALL_PREFIX`](https://cmake.org/cmake/help/latest/variable/CMAKE_INSTALL_PREFIX.html) to a path which is not on the CMake's default search list.
3. **Preserved Options**: The principal of DRY code extends to managing external dependencies, `cmake . -DJWT_DISABLE_PICOJSON` should create an installation where this optional dependency is not included and is carried downstream provided the `#define` with the `jwt-cpp::jwt-cpp` target.
4. **Managed Dependencies**: When the users selects the `JWT_SSL_LIBRARY` this should be captured in the installation and the correct `find_dependency` is called without adding extra unnecessary dependencies.

With these outlined we'll be able to leverage some [Behavioral Driven Development](https://en.wikipedia.org/wiki/Behavior-driven_development) practices and define test cases such as "Should find jwt-cpp with picoJSON" to ensure the functionality for consumers is correct.

## Leveraging GitHub Actions for Automated Testing

Let's write some [acceptance tests](https://en.wikipedia.org/wiki/Acceptance_testing) using GitHub Actions. Here's how it works:

1. **Matrix Strategy:** This allows testing across various platforms (e.g., Linux, macOS, Windows) and architectures (e.g., x86, x64) in parallel. The leans into CMake's strength for being cross-platform.
2. **CMake Configure:** Sets up the setting and configuration with `cmake` that are desired.
   * This is where most of the variation between the tests will occur.
3. **Installation:** Executes `cmake --install` with different prefixes (`CMAKE_INSTALL_PREFIX`) to simulate various installation scenarios.
4. **`find_package` Test:** Within a separate build directory for each test, the workflow uses `find_package` to locate your library and verifies if all required information is found (e.g., target names, include directories).

```yaml title='/.github/workflows/cmake.yml'
jobs:
  default:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: lukka/get-cmake@latest

      - name: setup
        run: |
          cmake --preset release
          sudo cmake --build --preset release --target install

      - name: test
        working-directory: tests/cmake # Example consumer project
        run: |
          cmake .
          cmake --build .
```

**By adapting this workflow to use the various options or dependencies in isolation, you can achieve a reliable and future-proof testing strategy.** This is extensible by expanding the matrix in a new job to include non-default installation paths or with different present names for pre-defined configurations that are supported.

## Testing CMake Config File Installation with a Consumer Project

A robust approach to verify your CMake config file installation is by creating a basic consumer project. This technique has the added benefit of acting as [living documentation](https://cucumber.io/blog/podcast/living-documentation/) for potential consumer to reference. This section explores this technique using a sample `CMakeLists.txt` file.

**Sample Consumer Project:**

```cmake title='/tests/cmake/CMakeLists.txt'
cmake_minimum_required(VERSION 3.8)
project(jwt-cpp-installation-tests)

# Setup your own source code here
set(TEST CACHE STRING "The test source file to be used")

find_package(jwt-cpp 0.7.0 EXACT REQUIRED CONFIG)

add_executable(test-project ${TEST}.cpp)
target_link_libraries(test-project jwt-cpp::jwt-cpp)
```

**Explanation:**

1. **Project Setup:** Required field to have a standalone CMake project.
   * `cmake_minimum_required(VERSION 3.8)`: Specifies the minimum required CMake version.
   * `project(jwt-cpp-installation-tests)`: Names the project for better organization.

2. **Test File Selection:**
   * `set(TEST CACHE STRING)`: Defines a cache variable named `TEST` to store the path of the source file to compile. This allows you to easily switch between different test files which should all work with the same entry point. By leveraging compiler features we can test for the presence of preprocessor and header files to ensure the installation is complete.

3. **Finding the `jwt-cpp` Library:**
   * `find_package(jwt-cpp 0.7.0 EXACT REQUIRED CONFIG)`: Attempts to locate the `jwt-cpp` library using `find_package`.
     * `0.7.0 EXACT`: Specifies the exact version of `jwt-cpp` to search for. This will help ensure the value is correctly captured by the `write_version_file` CMake helper.
     * `REQUIRED CONFIG`: Ensures the CMake will return a non-zero exit code if our library is not found.

4. **Building the Test Executable:**
   * `add_executable(test-project ${TEST}.cpp)`: Creates an executable named `test-project` that is built from the source file specified by the `TEST` variable.

5. **Linking the Library:**
   * `target_link_libraries(test-project jwt-cpp::jwt-cpp)`: Instructs the linker to include the `jwt-cpp` library when building the `test-project` executable. This implies all the transitive dependencies will be included implicitly.

### Success or Failure

* **Successful Build:** If the build completes without errors, it indicates that your CMake config file was installed correctly and the consumer project was able to find and link against the `jwt-cpp` library as well as the dependencies and ny optional features.
* **Build Failure:** If the build fails with errors related to missing headers or libraries, it suggests an issue with the installation or the config file. Double-check your installation rules and ensure the config file accurately reflects the library's location and targets. [`CMAKE_FIND_DEBUG_MODE`](https://cmake.org/cmake/help/latest/variable/CMAKE_FIND_DEBUG_MODE.html), introduced in version 3.17, is an excellent tool to check the search paths being used.

This approach provides a quick and straightforward method to verify the functionality of your CMake config file installation.

### Example CI Jobs

The use case  outline earlier have lot of variations, most of which include the users configure of a non-default configuration. Ensuring the generated and installed targets and `config.cmake` files correctly is also important.

**Testing Different Options:**

The "No Base64" option allows consumer to exclude the jwt-cpp built-in functions, these generalized implementation are not extensively optimized and many other libraries exist with this feature. This can be described as "Should find jwt-cpp without including base.h" as out BDD test case. This unique configuration will need it's own job. This will perform an out-os-source build and install with the option set to `ON` before an in-source consumer workflow to configure and build.

```yaml
  no-base64:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: lukka/get-cmake@latest

      - name: setup
        run: |
          mkdir build
          cd build
          cmake .. -DJWT_DISABLE_BASE64=ON -DJWT_BUILD_EXAMPLES=OFF
          sudo make install

      - name: test
        run: |
          cd tests/cmake
          cmake . -DCMAKE_PREFIX_PATH=/usr/local/cmake -DTEST:STRING="base64-is-disabled"
          cmake --build .
```

In order to test the library is installed and packaged correct, we can define our source test `.cpp` file instrumented with [`#error` directives](https://learn.microsoft.com/en-us/cpp/preprocessor/hash-error-directive-c-cpp) and [`_has_include` marco](https://gcc.gnu.org/onlinedocs/cpp/_005f_005fhas_005finclude.html) to validate the contents.

```cpp title='tests/cmake/base64-is-disabled.cpp'
#ifndef JWT_DISABLE_BASE64
#error "This test expects 'JWT_DISABLE_BASE64' to be defined!"
#endif

#if __has_include("jwt-cpp/base.h")
#error "This test expects 'jwt-cpp/base.h' to be absent from the installation!"
#endif

#include "jwt-cpp/jwt.h"

int main() {
   jwt::date date;
   return 0;
}
```

**Testing Different Dependencies:**

By strictly controlling our build environment and pinning the dependency's version we'd like to test, we can ensure a robust test case for "Should find jwt-cpp and use wolfSSL" can be implemented.

```yaml
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: lukka/get-cmake@latest
      - uses: ./.github/actions/install/wolfssl
        with:
          version: ab3bbf11e9d39b52e24bf42bbc6babc16d4a669b

      - name: setup
        run: |
          mkdir build
          cd build
          cmake .. -DJWT_SSL_LIBRARY:STRING="wolfSSL" -DJWT_BUILD_EXAMPLES=OFF
          sudo make install

      - name: test
        run: |
          cd tests/cmake
          cmake . -DTEST:STRING="wolfssl-is-used"
          cmake --build .
```

Once again, we can design a test source file to validate the include and marco from the dependency are provided. This also includes calling a core function from the library, `wolfSSL_library_init()` in this case, to ensure the library or runtime as well as link paths are correctly setup for consumers.

```cpp title='tests/cmake/wolfssl-is-used.cpp'
#if !__has_include(<wolfssl/ssl.h>)
#error "missing wolfSSL's SSL header!"
#endif

#ifndef OPENSSL_EXTRA
#error "missing wolfSSL's OPENSSL_EXTRA macro!"
#endif

#ifndef OPENSSL_ALL
#error "missing wolfSSL's OPENSSL_ALL macro!"
#endif

#include "jwt-cpp/jwt.h"

#include <wolfssl/ssl.h>

int main() {
   wolfSSL_library_init();
   jwt::date date;
   return 0;
}
```

## Supporting Various C++ Package Managers

:::note Disclaimer

This currently does not exists! With the big package managers running curated central repositories, their repositories and internal CI systems need to be aware of your project. The burden rests on their respective communities integrated and contributing back.

:::

## Summary

This automated testing approach empowers you to deliver a robust and user-friendly library by ensuring your CMake config files function as intended across various environments. **Test Essentials!** Run standard install commands (`cmake --preset release && cmake --install build/`) to verify config file placement. Building on this to handle more complex requirements like optional features or dependencies, remember the following approach:

* **Multi-Platform Power:** Leverage CMake's strength to test across platforms (Linux, macOS, Windows) in parallel.
* **Tailored Setups:** Use `cmake --presets` to configure different supported settings and configurations.
* **Simulated Installations:** Run `cmake --install` with varying prefixes to mimic real-world user scenarios.
* **`find_package` Verification:** Confirm your library and crucial information are found using `find_package` in separate detected sample consumer project and utilize a pass/fail test strategy.

If you are looking to implement and practice these ideas, this is an excellent opportunity to get involved in open-source libraries you are using, may projects will appreciate a thorough test suite for these features.
