# 餐厅配置说明

## 餐厅介绍配置

餐厅介绍存储在 `restaurant.txt` 文件中，这是一个纯文本文件，包含对餐厅的描述性文字。

### 如何修改

1. 直接编辑 `config/restaurant.txt` 文件，更改里面的文本内容
2. 保存文件后，应用将自动使用新的餐厅介绍

### Docker环境下的配置

如果您使用Docker部署：

1. 项目根目录的 `config/restaurant.txt` 文件已通过卷挂载到容器内
2. 修改主机上的文件会立即在容器中生效，无需重启容器

### 环境变量配置

您也可以通过环境变量指定不同的配置文件路径：

```
RESTAURANT_DESCRIPTION_PATH=/path/to/your/custom/description.txt
```

这在您需要在不同环境使用不同配置时很有用。 