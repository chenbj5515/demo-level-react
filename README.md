# demo-level-react

# 前言

这个仓库(https://github.com/chenbj5515/demo-level-react)
中我们会一步一步实现一个demo级的React，没有任何的技术上的新意与花样，仅供自己以及和自己一样的React初学者初步了解React的工作原理使用。

我们的目标：

- [ ]  清晰化vNode的基本结构以及JSX是如何转为vNode的(stage-0)
- [ ]  把vNode树render为真实DOM(stage-1, stage-2)
- [ ]  在上一个的基础上支持更新、删除节点的操作(stage-3,stage-4)
- [ ]  在上一个的基础上支持函数式子组件
- [ ]  在上一个的基础上支持函数式子组件的useState等hooks api
- [ ]  在上一个的基础上支持diff算法

# 从JSX到vNode

```tsx
// jsx
<div id="foo">
  <a>bar</a>
  <b />
</div>
```

```
// 经过babel处理变为函数调用
DemoLevelReact.createVNode(
  'div',
  {id: 'foo'},
  DemoLevelReact.createVNode(
    'a',
    null,
    'bar'
  ),
  DemoLevelReact.createVNode(
    'b',
    null,
    null
  )
)
```

```
// 最终变为vNode树
{
  type: 'div',
  props: {
    id: 'foo',
    children: [
      {
	type: 'a',
	props: {
	  children: [
	    {
	      type: 'TEXT_ELEMENT',
	      props: {
		  nodeValue: 'bar',
		  children: []
	      }
	    }
	  ]
	}
      },
     {
	type: 'b',
	props: {
		children: []
	}
     }
    ]
  }
}
```

通常来说，我们项目是通过@babel/preset-react这个插件合集来引入了babel用来转译jsx的包，实际上babel会默认转译为React.createElement这个函数调用而不是我们上面示例中写的createVNode这个函数，这也是为什么我们一个tsx文件明明没有显示用到React，但是确必须引入的原因。

不过babel提供了通过注释的方式更改调用的函数名字的机制

```tsx
// 这样我们就可以使用自己定义的方法啦

/** @jsx DemoLevelReact.createVNode */
const element = (
    <div id="foo">
        <App />
        <a>bar</a>
        <b />
    </div>
)
```

# 把vNode树render为真实DOM
vNode树是我们执行完渲染函数就有的，把vNode初次渲染为DOM仅仅是一个遍历创建DOM的过程，略过不表。（stage-1）<br>

## 时间切片
我们重点说下stage-2，stage-2中我们没有像老版本React那样全量创建、更新整个vNode树，因为每次都全量，尤其是首次全量创建的过程的会占用JS的单线程，有的场景下会有性能问题。
所以我们会像新版本React那样进行时间切片，每次渲染都会一个一个地将vNode树上的节点转为一个Fiber，如果浏览器有高优任务则把执行权交给浏览器，空闲了再继续转化vNode树上剩余的节点。

## fiber的结构
### 关系属性
一个Fiber的结构和vNode类似，只不过每个fiber会维护parent, sibling和child三个亲属fiber，用于遍历树，如图：
![alt fiber-tree](./src/diagram/fiber-tree.png)
这三个属性的获取当然是通过遍历vNode来的。

### effectTag
另外，fiber上还会带有如何更新DOM的信息.<br>
简单地说，如果树上的等位节点都是div标签，那么fiber上就会带有UPDATE的tag,最终更新DOM时会保留原有DOM，仅会更新属性和事件.<br>
如果等位上不存在旧fiber，那么就会给fiber打上PLACEMENT的tag，最终会创建新的DOM.<br>
而如果等位上存在老的没有新的fiber, 那么就会给老的fiber打上DELETE的tag, 最终会删除这个DOM.<br>

## fiber的遍历
fiber的遍历顺序看图就明白了, 用语言描述的话就是先return child，到底了就return sibling，没有sibling了就先找到parent后找return parent的sibling，直到parent也没有了就return null结束。
![alt fiber-order](./src/diagram/fiber-order.png)
