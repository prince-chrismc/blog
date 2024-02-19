---
slug: soeng-for-builds
# image: ./social-preview.png
title: DevOps Is Software Engineering for Your Builds
description: "Battling manual builds and dependency nightmares in C++? Consider a dedicated DevOps role on your team! This post explores how a skilled DevOps engineer, often misunderstood in the C++ community, can revolutionize your workflow. Imagine your developers focused on crafting robust code while a dedicated pro automates builds, manages dependencies, and implements CI/CD for faster releases. But it's not just tools – a DevOps expert bridges the dev-ops gap, navigates the C++ ecosystem like a pro, and automates repetitive tasks with mastery. This translates to efficiency, reliability, and happier developers. Ready to unlock your C++ team's potential? Dive in, explore the possibilities, and join the discussion on shaping the future of C++ development together!"
authors: [chris]
tags: [c++ development, devops, build automation, dependency management, ci/cd, software engineering, best practices, tools, platforms, collaboration, efficiency, reliability]
---

C++ developers often approach DevOps with a reasonable degree of skepticism, and it's not without reason. Their top five challenges revolve around build scripts, dependency management, and setting up CI pipelines—areas traditionally associated with DevOps responsibilities. [Michael Xymitoulias](https://www.linkedin.com/in/mxymitoulias/) articulated this sentiment well in a recent [LinkedIn post](https://www.linkedin.com/posts/mxymitoulias_cpp-cppprogramming-devops-activity-7159324126099193856-oUP3) writing:

> _Right now, it feels that C++ developers have to deal with way more than just writing business logic code. [...] Allowing devs to focus more on coding rather than trying to solve problems of the ecosystem would probably be liberating_

Xymitoulias suggestion that allowing developers to focus more on coding, rather than grappling with ecosystem problems, would be liberating. He's not alone, [Bill Hoffman, CTO behind CMake](https://www.linkedin.com/feed/update/urn:li:activity:7159324126099193856?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7159324126099193856%2C7159438503947161600%29&replyUrn=urn%3Ali%3Acomment%3A%28activity%3A7159324126099193856%2C7160306517584359426%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287159438503947161600%2Curn%3Ali%3Aactivity%3A7159324126099193856%29&dashReplyUrn=urn%3Ali%3Afsd_comment%3A%287160306517584359426%2Curn%3Ali%3Aactivity%3A7159324126099193856%29) supports this ideal of simplifying the developer workflows, something we've seen put in place with recent improvements to the popular build system.

While building in C++ certainly comes with its challenges, streamlining this process is our collective goal. So, let's delve into the core focus as it relates to C++ and dispel some common misconceptions.

<!--truncate-->

## Learning from the Past

These ideas have been circulating for quite some time.

> _All aspects of software production Software engineering is not just concerned with the technical processes of software development but also with activities such as software project management and with the development of tools, methods and theories to support software production._
> "1.1.2 What is software engineering?" - Software Engineering (8th ed.) ISBN 978-0-321-31379-9

This quote, from a book [originally published in 1982](https://www.abebooks.com/9780201137958/Software-engineering-International-computer-science-020113795X/plp), highlights the broader scope of software engineering, encompassing not only technical development but also project management and the development of tools and theories supporting software production.

Yet, expecting individuals to be experts in every tool, method, and theory is unrealistic. The diversity of modern software tooling and platforms necessitates specialized team members with technical skills and a passion for these tools. A Software Engineering team should consist of various roles catering to different aspects of the development process.

## Applying DevOps in C++ Development

Diego Rodriguez-Losada, the lead architect and co-found of Conan, one of the leading C++ package managers, presented the idea [DevOps is dependency and package management over time](https://youtu.be/NM-xp3tob2Q?t=2367) in his 2022 CppCon presentation. I would open that up to include not just the toolchains and libraries you use but the infrastructure which supports the builds. This quote, succinctly captures the question and motivation for doing this.

> _We propose that "software engineering" encompasses not just the act of writing code, but all of the tools and processes an organization uses to build and maintain that code over time. What practices can a software organization introduce that will best keep its code valuable over the long term? How can engineers make a codebase more sustainable and the software engineering discipline itself more rigorous?_
> "Programming Over Time." Software Engineering at Google (2020). ISBN 978-1-492-08279-8

As a DevOps Engineer, the aim is to support Software Engineering activities past, present and future, which for C++ include:

- **Managing build environments**: This involves detailing the contents, deployment methods, and update schedules of build environments. Infrastructure as code ensures repeatability and reliability, while versioning and storage solutions contribute to longevity. There are numerous tools for [deployment environment](https://en.wikipedia.org/wiki/Deployment_environment) and this is just an extension of those best practices.
- **Supporting building and testing**: This entails encapsulating build scripts from the environment, enabling their reuse as environments evolve. Binary management ensures that assets generated by builds are captured and saved for reuse, ensuring consistency from development to production.
- **Releasing and shipping to production**: This outlines translating internal engineering versions into business-level products, ready for deployment in assembly lines or cloud environments. Each product will be unique just as the target architectures they are compiled for.

This amalgamation constitutes the Software Development Lifecycle (SDLC), with [security being a top priority](https://slsa.dev/) though out. Strong collaboration among team members with diverse skills ensures that developers can focus on implementing product features, while DevOps practices uphold the integrity and reliability of the software.

## Demystifying DevOps

:::danger[Opinion]

This section is a small rant. [@me](https://twitter.com/intent/tweet?text=%F0%9F%8C%B6%EF%B8%8F%20%40prince_chrismc%20here%20is%20my%20take) on social media for discussion!

:::

While [criticism](https://www.linkedin.com/feed/update/urn:li:activity:7159324126099193856?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7159324126099193856%2C7159438503947161600%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287159438503947161600%2Curn%3Ali%3Aactivity%3A7159324126099193856%29) of a _"fragile hodgepodge system of jerry-rigged things that were never intended to work"_ resonates with many in the C++ community, I'd argue that is a bias based on the fragmentation within the ecosystem. It's essential to broaden our perspectives before drawing conclusions.

In many ecosystems, building projects is trivial, with straightforward commands like `cargo build`, `npm build`, or `maven build`. This is why we only hear about CI/CD with no "continuous building" concept which is completely skipped over. Once the challenge of building applications at scale for numerous developers multiple times a day is overcome, it becomes less of a focal point at conferences. This is why `cmake --build --preset release` is a huge step in the [right direction](/simple-ci-with-presets).

So maybe it is understandable to see the remark _"DevOps has such a full stack vibe about it"_? Not really, [fullstack means something completely different](https://www.mongodb.com/languages/full-stack-development). **DevOps is a bridging the gap between IT Operations and Software Development**. Contrary to beliefs that C++ is excluded from this paradigm, various tools and platforms support C++ development within the DevOps framework. GitHub Actions and Azure DevOps platoformns have support for less common toolchains like [MSYS2/Mingw-64](https://www.msys2.org/docs/ci/). [GitLab](https://about.gitlab.com/blog/2020/03/31/conan-c-cpp-package-management-integration/) and [Gitea](https://docs.gitea.com/usage/packages/conan) have [integrations for Conan packages](https://about.gitlab.com/blog/2020/03/31/conan-c-cpp-package-management-integration/). Jenkins has been used for [C++ CI/CD for many years](https://www.jenkins.io/blog/2017/07/07/jenkins-conan/) and helped pioneer concepts like [Pipelines as Code](https://www.techtarget.com/searchsoftwarequality/definition/pipeline-as-code).

Comments like "neverending fighting non-coding related bugs is fun but only from devops perspectives" miss the mark. A strong DevOps Engineer possesses knowledge of [Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac), enabling them to develop well-designed applications compatible with distributed systems and third-party services. Learning [HCL for Terraform](https://developer.hashicorp.com/terraform/language/syntax/configuration), [extending it with Golang](https://www.hashicorp.com/blog/writing-custom-terraform-providers), and [developing test](https://developer.hashicorp.com/terraform/language/tests) are absolutely fundamental just like any robust software stack. It's no different then developing on top of [Boost.Asio](https://stackoverflow.com/a/55652158).

## Ecosystem and Evolution

To put it all into perspective, as a C++ developer, grappling with tedious build processes and platform-dependent multithreading complexities is a familiar struggle. However, embracing DevOps principles can alleviate these challenges, allowing developers to focus on crafting robust and efficient code.

In Xymitoulias post, Hoffman wrote:

> _It is all about creating an environment where C++ developers can focus on code and have the DevOps happen for them._

And I think that's the perfect place to aim for.
