# [Robin](https://robinapp.co) Chat SDK for JavaScript

![Platform](https://img.shields.io/badge/platform-JAVASCRIPT-orange.svg)
![Languages](https://img.shields.io/badge/language-JAVASCRIPT-orange.svg)

## Table of contents

  1. [Introduction](#introduction)
  1. [Before getting started](#before-getting-started)
  1. [Getting started](#getting-started)
  1. [Sending your first message](#sending-your-first-message)


<br />


## Introduction

Through the Robin Chat SDK for Javascript, you can efficiently integrate real-time chat into your client app. On the client-side implementation, you can initialize, configure and build the chat with minimal effort. On the Chat SDK, Robin ensures reliable infra-management services for your chat within the app. This **read.me** provides the Chat SDK’s structure, supplementary features, and the installation steps.

### How it works

It is simple to implement chat in your client app with the Chat SDK: a user logs in, sees a list of conversations, selects or creates a conversation (direct message) or a group, and, through the use of the robin websocket event handlers, sends messages to the conversation, while also receiving them from other users within the conversation or group.

<br />

## Before getting started

This section shows you the prerequisites you need to check for using Robin Chat SDK for JavaScript. If you have any comments or questions regarding bugs and feature requests, visit [Robinapp community](https://community.robinapp.co).

### Supported browsers

| Browser | Supported versions |
| :---: | :--- |
| Internet Explorer | 10 or higher |
| Edge | 13 or higher |
| Chrome | 16 or higher |
| Firefox | 11 or higher |
| Safari | 7 or higher |
| Opera | 12.1 or higher |
| iOS Safari | 7 or higher |
| Android Browswer | 4.4 (Kitkat) or higher |

## Getting started

This section gives you information you need to get started with Robin Chat SDK for JavaScript.

### Try the sample app

The fastest way to test the Chat SDK is to build your chat app on top of our sample app. To create a project for the sample app, download the app from our GitHub repository. The link is down below.

- https://github.com/robin-io/robin-vue-sdk-demo

You can also download the sample using a git command:

```bash
$ git clone https://github.com/robin-io/robin-vue-sdk-demo
```


### Different sample projects

For JavaScript, Robin supports a variety of sample projects. Their installation procedures are detailed as below:

#### Run the web sample projects

1. Download and install `NodeJS` if your system doesn't have it yet.
2. Open a terminal and move to the project path.
```bash
$ cd robin-vue-sdk-demo
```
3. Install packages that are used in the sample project.
```bash
$ npm install
```
4. Run the sample project.
```bash
$ npm run start
```

<br/>

### Here are the steps to install Chat SDK

Follow the simple steps below to build the Chat SDK into your client app.

#### Step 1: Create a Robinapp account

A Robinapp account comprises everything required in a chat service including users, message, and api-keys. To create an application:

1. Go to the [Robinapp Dashboard](https://dashboard.robinapp.co/signup) and enter your email and password, and create a new account.
3. Navigate to [Api Config](https://dashboard.robinapp.co/apiconfig) and copy your `API key`


> Note: All the data is limited to the scope of a single user account, thus the users in different Robinapp accounts are unable to chat with each other.

#### Step 2: Install the Chat SDK

If you’re familiar with using external libraries or SDKs, installing the Chat SDK is simple.You can install the Chat SDK with package manager `npm` or `yarn` by entering the command below on the command line.

- **Npm**

> Note: To use npm to install the Chat SDK, Node.js must be first installed on your system.

```bash
$ npm install robin.io-js --save (request to npm server)
```

Install via `Npm` and import like below in your `TypeScript` file.

```bash
import { Robin } from 'robin.io-js';
var robin = new Robin("<api-key>", true);
// do something...
```

If you have trouble importing Robin, please check your `tsconfig.json` file and change the value of `allowSyntheticDefaultImports` to true in `compilerOptions`.

- **Yarn**

```bash
$ yarn add robinapp.io-js
```

<br />

## Sending your first message

Follow the step-by-step instructions below to authenticate and send your first message.

### Authentication

To use the features of the Chat SDK in your client app, a `robin` instance must be initiated in each client app before user authentication with Robin server. These instances communicate and interact with the server based on an authenticated user account, allowing for the client app to use the Chat SDK features.

### Step 1: Initialize the Chat SDK

You need to initialize a `robin` instance before authentication. Initialization binds the Chat SDK to Javascript’s context which allows the Chat SDK to respond to connection and state changes and also enables client apps to use the Chat SDK features.

To initialize a `Robin` instance, pass the `API key` of your Robin account in the dashboard as the first argument to a parameter in the `new Robin()` method and `true` or `false` for the nex parameter as it tells the sdk whether to load with ssl or not. As the `new Robin()` can only be a single instance, call it only a single time across your Javascript client app. Typically, initialization is implemented in the user login screen.

> **Note**: It is recommended to initialize the Chat SDK at the top of your Javascript file.

```javascript
var robin = new Robin("<api_key>", true);
```

### Step 2: Connect to Robin server


Connect a user to Robin server either through a unique user ID called a `user_token `, as it ensures privacy with the user.

#### A. User Token

Create user token
```javascript
let resp = await robin.createUserToken({
  meta_data:{
    username:"elvis"
    }
  })

```

Connect a user to Robin server using their unique **user_token**.
```javascript
robin.connect(USER_TOKEN);
```

### Step 3: Channels

All messages sent via Robin are sent through channels, you can consider channels as tunnels that relay messages to all connected clients.


### Step 5: Send a message to the channel

Finally, send a message to the channel.

```javascript
robin.sendMessageToConversation(msg: object, conn: WebSocket, channel:string,conversation_id: string, senderToken?: string);
// senderToken = user_token
// msg should be s json encodable object
```

<br />