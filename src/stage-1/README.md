# 写出render函数，将element对象转为实际DOM：

```
// 输入：
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

// 目标输出
实际DOM
```