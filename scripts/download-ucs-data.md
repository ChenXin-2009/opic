# UCS卫星数据库下载指南

## 数据来源
Union of Concerned Scientists (UCS) 卫星数据库
- 官方网站: https://www.ucs.org/resources/satellite-database
- 最新版本: 2023年5月1日 (7,560颗卫星)

## 下载步骤

1. 访问 https://www.ucs.org/resources/satellite-database
2. 下载Excel或CSV格式的数据文件
3. 将文件保存为 `ucs-satellite-database.csv`
4. 放置到项目根目录的 `scripts/data/` 文件夹

## 数据字段说明

UCS数据库包含以下字段:
- Name: 卫星名称
- Country/Org of UN Registry: 注册国家/组织
- Operator/Owner: 运营商/所有者
- Users: 用户类型
- Purpose: 用途
- Class of Orbit: 轨道类别
- Type of Orbit: 轨道类型
- Perigee (km): 近地点高度
- Apogee (km): 远地点高度
- Eccentricity: 偏心率
- Inclination (degrees): 倾角
- Period (minutes): 轨道周期
- Launch Mass (kg): 发射质量
- Dry Mass (kg): 干质量
- Power (watts): 功率
- Date of Launch: 发射日期
- Expected Lifetime (years): 预期寿命
- Contractor: 承包商
- Country of Contractor: 承包商国家
- Launch Site: 发射场
- Launch Vehicle: 运载火箭
- COSPAR Number: COSPAR编号
- NORAD Number: NORAD编号
- Comments: 备注
- Source: 数据来源

## 转换脚本

下载完成后,运行以下命令转换数据:

```bash
npm run convert-ucs-data
```

这将生成 `public/data/satellite-metadata.json` 文件供应用使用。
