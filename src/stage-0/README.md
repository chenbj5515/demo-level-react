# 利用babel，使用自定义的createElement函数将这段JSX转为目标对象：

```
// 输入：
<div id="foo">
    <a>
    	bar
	</a>
	<b />
</div>

// 目标输出
{
    "type": "div",
    "props": {
        "id": "foo",
        "children": [
            {
                "type": "a",
                "props": {
                    "children": [
                        {
                            "type": "TEXT_ELEMENT",
                            "props": {
                                "nodeValue": "bar",
                                "children": []
                            }
                        }
                    ]
                }
            },
            {
                "type": "b",
                "props": {
                    "children": []
                }
            }
        ]
    }
}
```