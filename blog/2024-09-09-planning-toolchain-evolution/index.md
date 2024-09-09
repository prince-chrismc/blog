---
image: ./social-preview.png
description: "Managing a native build system for complex products over extended periods requires a strategic approach to toolchain evolution. This blog post explores the key considerations and challenges faced by product planning and development teams. Discover the pros and cons of various strategies like owning hardware design, controlling the toolchain, or staying on the bleeding edge. Learn how to navigate security updates, technical debt, and knowledge transfer while ensuring long-term product success. Optimize your CI/CD pipeline and build a robust build process that embraces innovation and future-proofing."
authors: [chris]
tags: [toolchain evolution, build system, security updates, native software, product planning, scalability,continuous integration,continuous deployment,security,toolchain management,operating systems,hardware platforms,security compliance]
---

# Toolchain Evolution: Designing and Operating a Native Build System Over Many Years

In the DevOps playground of software development, designing and maintaining a [native](https://en.wikipedia.org/wiki/Native_(computing)) [build automation](https://en.wikipedia.org/wiki/Build_automation) process for a complex product [over many years](https://www.toptal.com/c/after-all-these-years-the-world-is-still-powered-by-c-programming) presents unique challenges. One topic which often gets over looked by [product planning](https://www.atlassian.com/agile/product-management/product-roadmaps) is upgrading compilers. The gritty work for ensuring the product maintains supported for existing platforms while offering access to new tools to developers to be innovative for a competitive edge.

Planning for this change is [**Toolchain Evolution**](/2024/08/26/designing-a-build-process).

> Either maintaining old toolchains as new platforms arrive or a backport of toolchain on to an older platforms or any combination would satisfy the definitions.

There are two main forces driving teams to upgrade their toolchains, the first being security and the second also being security. The first is product security or "code safety", every year compilers and sanitizers are improving and offer new features that when utilized can detect [buffer-overflow](https://owasp.org/www-community/vulnerabilities/Buffer_Overflow) or [free-after-use](https://cwe.mitre.org/data/definitions/416.html?) and prevent many vulnerabilities which are discovered. The second, less talked about, is corporate IT Security or "software supply chain security" where with native toolchains might be obsolete and pose a greater burden to maintain development.

Regardless which of these factors is motivating you, this post will explore the strategic considerations and operational challenges of managing a native build system for long-term success leveraging the concept of Toolchain Evolution during a product's lifecycle to help address both security needs.

<!--truncate-->

## Why Strategic Business Planing is Key

Slow builds slow down the business, not just engineering. Ensuring [enough priority](https://www.redhat.com/en/services/training/tl500-devops-culture-and-practice-enablement) is balanced with improving and evolving builds is critical to keeping up with changing requirements. Given the complexity and scale a one-size-fits-all build process is unlikely to succeed. Instead, a strategic approach that divides the work and optimizes for different types of builds is essential. These complicated distributed systems will be prime targets for threat actors - [requiring IT security baseline](https://www.microsoft.com/insidetrack/blog/improving-security-by-protecting-elevated-privilege-accounts-at-microsoft/) to be up held to prevent being the weak line in a [supply chain attack](https://www.zscaler.com/resources/security-terms-glossary/what-is-a-supply-chain-attack). This connection is directly pulled from the [philosophy of DevOps](/why-devops-in-cpp).

Far to often this topic is over shadowed with making the _code_ safe. ["C++ Safety"](https://herbsutter.com/2024/03/11/safety-in-context/) and ["Delivering Safe C++"](https://www.youtube.com/watch?v=I8UvQKvOSSw) have gotten a lot of attention, but both piece suggest, that is only part of a good [Defense in Depth](https://csrc.nist.gov/glossary/term/defense_in_depth) strategy. Back in 2023, an excellent report about [C++ Standards Usage](https://www.infoworld.com/article/2335793/the-state-of-the-c-plus-plus-developer-ecosystem.html) which highlighted the lack luster adoption of C++23... The [2024 C++ ISO Survey](https://isocpp.org/files/papers/CppDevSurvey-2024-summary.pdf) once again has 61% are "not allowed" to use C++23 along with 36% "not allowed" to use C++20. This sluggishness is not new, even if we invent a better more safe version of C++ it very well could take 10 years for it to be adopted by the industry.

This is why it's imperative to incorporate toolchain evolution into the product development roadmap.

## Assumptions and Context

Before diving into the details, let's establish some baseline assumptions:

1. **Complex Product**: The product in question is complex enough that any build will require significant effort (i.e time on a CPU). This isn't a simple application but a multifaceted system with numerous [interdependent components](https://www.lawinsider.com/dictionary/interdependent-components).
2. [**Component-Based Architecture**](https://link.springer.com/book/10.1007/11783565): The software is divided into several components, each of which contributes to the overall functionality. These components may be developed by different teams or even across different geographies.
3. [**Long-Term Perspective**](https://enterprisecraftsmanship.com/posts/short-term-vs-long-term-perspective/): The build system needs to be designed not just for today but with an eye toward [future-proofing](https://patrickkarsh.medium.com/designing-for-long-term-vs-complexity-in-software-architecture-mastering-system-design-0c30e7e0f576), scalability, and adaptability.

### What is a Native build system?

A [**native build system**](https://docs.gradle.org/current/userguide/native_software.html) is a software infrastructure designed to compile, link, and package code into executable programs or libraries specifically for a particular operating system and/or hardware platform. It operates directly within a target environment, utilizing the system's native tools, compilers, and dependencies to produce optimized, platform-specific binaries which may run on the same or different target platform.

## Various Strategic Approaches

With unlimited money and large workforces it's easier to practice a large philosophical design concepts for how products and developed can be released to costumers. Large tech companies are often easy examples to see what different variations exist.

Planning to innovate and adopt technologies is always a balancing act which comes at odds with supporting existing hardware. The combinatorics of platform support means inevitably old platforms will no longer be supported. There's will always be [laggards](https://en.wikipedia.org/wiki/Technology_adoption_life_cycle) and those systems will need to be moved on to newer platforms which might no be compatible.

Building into the build automation process to support both can be a huge advantage.

### Owning the Hardware Design

One strategy, that has been increasing in the spotlight thanks to large tech companies, for controlling toolchain evolution is to own the hardware design. By designing their own chips, companies can tailor the underlying architecture to their specific needs and ensure that the existing toolchain remains tightly integrated and provides greater control. Ensuring hardware support over the generations of the product allows for more predictable updates and support.

A notable example of this strategy is Google's decision to develop its own [mobile processors for its Pixel smartphones](https://blog.google/products/pixel/introducing-google-tensor/). By designing these processors in-house, Google can ensure that they are optimized for its specific software requirements and that the toolchain remains tightly integrated. Furthermore, Google's commitment to [providing seven years of security updates](https://support.google.com/pixelphone/answer/4457705?hl=en#zippy=%2Cpixel-pixel-pro-pixel-pro-xl-pixel-pro-fold) for its Pixel devices demonstrates its long-term focus on toolchain evolution and product support.

While owning the hardware design offers significant advantages for controlling toolchain evolution, it's not without drawbacks. The high upfront investment, increased complexity, and potential for delays can be significant hurdles for smaller companies. Additionally, custom hardware may not be suitable for all markets, and companies may face [obsolescence down the line](https://support.apple.com/en-us/102772) when committing to older technologies.

### Controlling the Toolchain

Another effective strategy for managing toolchain evolution is to maintain control over the toolchain itself. This involves developing or customizing the tools that allow access or control of the product and ensuring that the toolchain remains compatible. By controlling the toolchain, organizations can maintain greater flexibility in their product development process.

Apple's SDKs are an excellent example of this. By releasing it's own toolchain, Apple has gained greater control over what hardware configurations are supported, and by tying this into the [operating systems release cycle](https://developer.apple.com/support/xcode/). The Apple-clang compiler, which is specifically designed for Apple's tightly controlled architecture, provides a powerful and optimized tool for developing software for these platforms. This allows them to dictate what [version of the toolchains](https://developer.apple.com/news/upcoming-requirements/?id=04292024a) are used and can plan to phase out older toolchains.

:::info Stay Tuned

This strategy can be scaled up or down in some unique and useful ways. This will be the third post focusing on bringing older compilers to newer platforms with the aim of maintaining legacy code bases.

:::

### Inventing the Build Systems

While maintaining control over the toolchain is important, it is also essential to stay on the cutting edge of technology. By adopting new tools and techniques as they emerge, organizations can improve product quality, reduce development time, and stay ahead of the competition. However, it is crucial to balance the benefits of adopting new technology with the risks associated with early adoption.

Facebook's approach to software development, which involves [rebuilding its entire codebase (a monorepo)](https://engineering.fb.com/2014/01/07/core-infra/scaling-mercurial-at-facebook/) together, demonstrates a commitment to living on the bleeding edge. By continually modernizing its [infrastructure and toolchain](https://engineering.fb.com/2023/06/27/developer-tools/meta-developer-tools-open-source/) along with the [code base](https://engineering.fb.com/2023/10/24/data-infrastructure/automating-dead-code-cleanup/), Facebook can take advantage of the [latest advancements in technology](https://ndmitchell.com/#build_01_jan_2022) and ensure that its products remain competitive. However, this approach also requires significant investment in infrastructure, testing, and risk management.

### A Combined Approach

To achieve the best results,  most organizations should consider a combined approach that incorporates all three strategies and variations of these ideas tweaked to meet their unique needs. Planning to maintain hardware compatibility, building your own toolchains and designing a solid build process, companies can create a robust and flexible product development ecosystem that supports long-term innovation and success. That is easier said then done. There are trade-offs at every corners and picking the write ones for your business are imperative.

## Operational Challenges and Long-Term Considerations

Maintaining support for older hardware generations is offers a lot of incentive to customer, however eventually will not be feasible. Tesla is a fun example where they still offer updates for a 2012 Model S with [upgrade infotainment systems](https://www.tesla.com/support/infotainment#:~:text=Owners%20of%20Model%20S%20and,installation%2C%20for%20all%20other%20vehicles.) but the 2023 Model 3 and Model Y may [no longer receive updates](https://www.notateslaapp.com/news/2149/tesla-fsd-v125-now-supports-additional-models-hardware-3-vehicles-still-waiting) for the long await ["FSD" beta-program](https://www.autoevolution.com/news/elon-musk-suggests-it-s-the-end-of-the-road-for-the-hardware-3-autopilot-computer-236318.html). Building the same code across many generations of hardware changes is no small feet.

Over time, several challenges will inevitably arise when managing a build system:

- **Scalability**: As your product grows, so too will the complexity of your code and the build system. Regularly review and optimize your build processes to handle increased demands with an iterative approach.
- **Toolchain Evolution**: The tools and technologies used in your build system will evolve. Ensure that your system is adaptable and that you have a plan for updating and integrating new tools as they become available.
- **Technical Debt**: Build systems, like any other part of the software, can accrue technical debt. Regular refactoring and cleanup of build scripts, configurations, and dependencies are necessary to prevent build times from ballooning and reliability from degrading.
- **Documentation and Knowledge Sharing**: Maintain thorough documentation of the build system and processes. As team members come and go, this documentation will be invaluable in preserving institutional knowledge and ensuring continuity.

### Long-Term Support for Specific Hardware Platforms

Supporting software on specific hardware platforms for five or more years presents a unique set of challenges. The tools you choose at the start of a project may not be supported on future versions of the operating system or may lack the necessary updates to remain viable as the security landscape evolves. The other side is also true, newer version of tools many stop support or become incompatible with older platforms preventing their adoptions. Aim to have support your own toolchains or work with vendors to ensure their support cycle is correctly aligned.

### Strategies for Managing Toolchain Evolution

Successfully managing toolchain evolution requires a proactive and strategic approach. [Build more configurations](https://moderncppdevops.com/build-more-configurations) is the best default advice.

1. **Regular Audits and Updates**: Conduct regular audits of your platform (hardware or operating systems) to identify any components that may be nearing the end of their support life or that have known vulnerabilities. Schedule updates and migrations well before they become critical, ensuring that your build system remains secure and functional.
2. **Automated Testing and Validation**: Implement automated testing frameworks that can validate the output of your build system across different versions of your toolchain. This helps ensure that updates or changes do not introduce regressions or new issues.
3. **Early Adopter Releases**: Provide a copy of each release with a development copy to customer to beta test and provide early feedback. Having an exact copy with a newer toolchain can help smooth the transition when migrating with newer generations.
4. **Vendor Collaboration**: Maintain strong relationships with tool and platform vendors. Early access to new versions, patches, and support can be crucial in ensuring a smooth transition when updating your toolchain. Vendors can also provide insights into future changes that might affect your build system.
5. **Documentation and Knowledge Transfer**: As your team evolves, it's essential to maintain thorough documentation of your toolchain choices, configurations, and the rationale behind them. This documentation should include detailed procedures for updating tools, managing compatibility issues, and handling security patches. This ensures that future team members can continue to manage the build system effectively, even if they weren't involved in its original design.

## Conclusion

Toolchain evolution is not a one-size-fits-all solution, but rather a strategic dance between security, innovation, and practicality. By considering the various approaches – owning the hardware design, controlling the toolchain, or staying on the bleeding edge – organizations can craft a plan that best suits their needs.  Understanding the long-term implications of hardware compatibility, technical debt, and knowledge transfer are all crucial components for building a robust build process.

Ultimately, a well-designed and well-maintained build system that embraces toolchain evolution is the cornerstone of long-term product success.  It allows developers to innovate with the latest tools and technologies, while ensuring that the product remains secure and functional for existing hardware platforms. This delicate balance between legacy support and future-proofing is the key to building software that endures.
