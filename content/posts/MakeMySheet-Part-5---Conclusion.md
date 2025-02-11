---
title: MakeMySheet Part 5 - Conclusion
published_at: 2025-02-12T16:00:00.000Z
read_time: 1
prev_post: content/posts/MakeMySheet-Part-4---Testing-and-QA.md
next_post: ''
excerpt: Lessons Learned from the MakeMySheet
---

![](/images/blog/makemysheet/image39.png)

# Conclusion

The [MakeMySheet](https://makemysheet.com) project has been an incredible learning experience, especially in understanding the complexities of microservices architecture. Managing multiple services, each with its own database, APIs, and communication methods, proved to be much harder than anticipated. In the end, I realised that whether to choose microservices or a monolith depends heavily on the specific business needs and use cases of the project. Microservices offer flexibility and scalability but come with their own set of challenges—something I only fully appreciated through this hands-on experience.\
\
Currently, the application is self-hosted on my personal laptop. AWS, though powerful, was simply too expensive for this scale, so I’m using [Pinggy.io](https://pinggy.io) for tunnelling to manage external access.

# Future Plans

Looking ahead, I have exciting improvements planned. I aim to orchestrate the containers using Kubernetes, add logging and monitoring with Grafana and Prometheus, and introduce caching with Redis to improve performance. Additionally, I’m looking to fix the anti-pattern of using a result queue. From what I’ve gathered, it might be better for workers to send results directly instead of buffering, but I’m open to suggestions if I’m wrong.\
\
This project has not only enhanced my technical skills but also shaped my understanding of building scalable, efficient systems. 🤓☝️
