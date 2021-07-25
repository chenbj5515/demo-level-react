# demo-level-react

# 前言

这个仓库中我们会一步一步实现一个demo级的React，没有任何的技术上的*新意与*花样，仅供自己以及和自己一样的React初学者初步了解React的工作原理使用。

我们的目标：

- [ ]  清晰化vNode的基本结构以及JSX是如何转为vNode的(stage-0)
- [ ]  把vNode树render为真实DOM(stage-1, stage-2)
- [ ]  在上一个的基础上支持更新、删除节点的操作(stage-3,stage-4)
- [ ]  在上一个的基础上支持函数式子组件
- [ ]  在上一个的基础上支持函数式子组件的useState等hooks api

# 从JSX到vNode

```tsx
// jsx
<div id="foo">
	<a>bar</a>
	<b />
</div>

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