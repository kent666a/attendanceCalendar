用过一些开源的日历，但对于自定义去绑定数据在日历元素中却不是很方便，由于工作需要用到考勤日历，考虑到日历的实现也不是特别麻烦，于是自己弄了一个，样式比较简单，需要的可以自己去扩展。使用的时候绑定获取数据的方法即可，在这个日历中我没有直接添加选择月份。各位有兴趣可以自己扩展，已预留设置日期的方法。 自定义去扩展的时候注意保证原有的代码结构不变，增加一些方法即可


### 使用方式：
首先创建一个对象，并对日期进行初始化加载日历界面，构造函数的三个参数分别代表：
- _obj 日历的div元素
- _fn 考勤数据的获取方法，返回的数据必须为数组，具体属性绑定请见{@link bindAttendance}，可为空，为空则可直接传入数组
- 显示日期的label的id
```
var ac = new AttendanceCalendar("calendar_div", null, "current_date_label");
ac.init();
```

#### 如果需要绑定数据可加入如下代码：
1. 绑定数组：
```
ac.setGetDataType(1);
var model = {
    dValue: 'datetime',
    status: 'status',
    absense: 0,
    normal: 1
};
ac.setModel(model);
ac.setAttendance(getData2());
```

2. 绑定函数获取数据则在创建对象时传入获取数据函数即可。

#### 你也可以绑定点击日期回调函数,返回参数为所选日期，如：
```
ac.setClickFn(clickFn);
function clickFn(clickDate) {
    alert(clickDate);
}
```

示例演示：

![示例演示](https://github.com/kent124454731/attendanceCalendar/blob/master/images/sample.gif)
