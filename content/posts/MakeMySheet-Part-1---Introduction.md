---
title: MakeMySheet Part 1 - Introduction
published_at: 2025-02-08T16:00:00.000Z
read_time: 2
prev_post: ''
next_post: content/posts/MakeMySheet-Design-Doc.md
excerpt: Introduction to MakeMySheet
---

> [MakeMySheet](https://makemysheet.com) is an AI music transcriber tool that converts music audio into music sheet. MakeMySheet is a project I created with [Shi Xin](https://github.com/apollo-tan) for NUS Orbital at the Artemis level. The contents here were taken from our [ReadMe](https://drive.google.com/file/d/1MSCzP2GQiQ_NtrvwtkeRR3pjgD7xxjvQ/view), with some portions cut off to reduce redundancy. This post is part of a series of posts where I break down the technical decisions behind MakeMySheet.\
> \
> However, do note that the ideas shared here may not be the best. MakeMySheet is currently undergoing refactoring to ensure best practices are maintained.

# Introduction

MakeMySheet is an AI-driven tool designed to convert audio files into piano sheet music, catering to hobbyist musicians, aspiring songwriters, music students, and professionals. It provides an efficient way to transcribe pop songs into piano arrangements, eliminating the need for manual transcription. The platform offers both a web interface and a Telegram bot for easy access to the service.

## Motivation

The project stems from a passion for music, especially for those who wish to play piano covers but lack the technical expertise for transcribing and arranging songs. While quality arrangements are available online, they often come at a cost, and free resources may be inaccurate. MakeMySheet aims to offer an accessible solution by automating transcription, benefiting both hobbyists and professional musicians alike.

## User Stories

* Enthusiast Instrumentalists: Upload audio and receive piano sheet music for covers or leisurely play.
* Bandmates: Identify harmonies and vocal parts, collaborate on arrangements for events or gigs.
* Music Teachers: Quickly generate sheet music for popular songs to engage students.
* Aspiring Songwriters: Transcribe audio recordings into sheet music for analysis and sharing.
* Professional Musicians: Generate rough drafts of sheet music for live performances.
* Music Producers: Transcribe tracks into sheet music for remixing or rearranging.
* Music Students: Transcribe pop songs for coursework and analyze compositions.

## Service Overview and Tech Stack

* Web Frontend: React with Next.js (TypeScript), Redux
* Web API Backend: Node.js, Express.js (TypeScript)
* ML Service: Python-based Pop2Piano
* Telegram Bot: Node.js, Telegraf (TypeScript)
* Message Queue: RabbitMQ
* Authentication: Auth0 (OAuth 2.0, JWT)
* Database: PostgreSQL with CockroachDB
* File Storage: AWS S3
* DevOps: Docker Compose for service orchestration

## Core Features

* Audio File Conversion: Upload audio and receive a PDF piano arrangement, with file storage in AWS S3.
* Interactive Music Sheet: View and interact with MIDI playback, compare with original audio.
* Companion Telegram Bot: Access features via Telegram with a minimal interface.
* Support for Various Arrangements: Generate different musical arrangements, including instrumentals and vocals.
* YouTube/Spotify Links: Accept links for audio input.
* Public Sheet Availability: Set and view public music sheets.

# Summary

MakeMySheet serves a diverse range of users, including instrumentalists, songwriters, music students, and professional musicians. The tech stack includes a Next.js frontend, an Express.js backend, a Python-based Pop2Piano ML service, and integrations with Telegram, AWS S3, and RabbitMQ. Key features include audio file conversion, interactive sheet music, and support for YouTube/Spotify links.

## What's Next

In the next blog post, I’ll dive into the technical architecture of MakeMySheet, breaking down how the different components interact to process and transcribe music efficiently.
