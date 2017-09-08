# SReact
一个简单的React框架的实现，实现了React的核心，包括：虚拟DOM、生命周期（暂时componentWillUnmount暂缺），批量更新，diff算法。
事件：是使用的原生的document.addEventListner添加的，支持捕获，和冒泡，使用方式和React的使用相同。
省去了react源码中的事务，声明周期中的回调和setState的回调，使用的是事件监听机制实现的。
一个小玩具。加深对源码的理解。
# 使用方法
在src目录下有文件index.js、index1.js.
index1.js是测试用的，有测试过程
index.js 是使用这个简单的框架写的todolist。
git clone https://github.com/sivkun/SReact.git
npm install
npm start  // 运行todolist
