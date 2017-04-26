/**
 *
 * @Author Kent.Wang
 * @Date 2017-04-20 12:02:49
 *
 *
 * @param _obj 日历的div元素
 *
 * @param _fn 考勤数据的获取方法，返回的数据必须为数组，长度与当前月份天数一致，
 * 具体属性绑定请见{@link bindAttendance}
 *
 * 显示日期的label的id
 *
 */
function AttendanceCalendar(_obj, _fn, lable) {
    var $elem;
    var $content;
    var getDataFn;
    var $left, $right;
    var $actualDate;            //实际日期
    var myDate;                 //当前日期
    var date;                  //当前日(1-31)
    var day;                    //当前星期X(0-6,0代表星期天)
    var firstWeekDay;          //1号星期X
    var mds;                   //当月天数
    var index = 0;             //索引(若是需要对日历的属性进行赋值，该索引可直接作为数组索引)
    var attendances = [];
    var hasMoveButton = false;  //是否开启日历上下月翻动按钮
    var refreshBody = false;
    var showCurrentDateFlag = true;
    var target_lable = lable;   //当前日期需要绑定的位置
    var currentYM = null;     //当前年月

    /**
     * 配置
     */
    (function config() {
        $elem = document.getElementById(_obj);
        getDataFn = _fn;
    })();

    /**
     * 创建日历
     */
    function initCalendar() {
        index = 0;              //索引
        initArray();
        initDate();
        $elem.innerHTML = null;
        addLeftBtn();
        initCalendarBody();
        addRightBtn();
    };

    initCalendar();

    /**
     * 初始化绑定数据
     * 此获取的数组长度必须与当月的天数一致
     */
    function initArray() {
        attendances = [];
        if (getDataFn && typeof getDataFn == "function") {
            attendances = getDataFn(getYearAndMonth(myDate));
        }
        else {
            for (var i = 0; i < 30; i++) {
                var num = GetRandomNum(0, 2);
                attendances.push({day: i, status: num});
            }
        }
    }

    /**
     * 获取随即数
     * @param Min
     * @param Max
     * @returns {*}
     * @constructor
     */
    function GetRandomNum(Min, Max) {
        var Range = Max - Min;
        var Rand = Math.random();
        return (Min + Math.round(Rand * Range));
    }

    /**
     * ym 年月
     * 初始化参数
     */
    function initDate() {
        setDate();
        date = myDate.getDate();
        day = myDate.getDay();
        firstWeekDay = getfirstWeekDay();
        mds = DayNumOfMonth(myDate.getYear(), myDate.getMonth() + 1);
        currentYM = myDate.getFullYear() + "-" + formatMonth(myDate.getMonth());
        hasMoveButton = true;
    }

    /**
     * 比较传入日期与当前日期年月是否一样，一样则不刷新当前日历，否则刷新
     * @param _newDate
     */
    function setDate(ym) {
        if (ym) {
            var _newDate = convertDateFromString(ym);
            var newYm = getYearAndMonth(_newDate);
            var currentYm = getYearAndMonth(myDate);
            if (newYm == currentYm) {
                refreshBody = false;
            }
            else {
                myDate = _newDate;
                refreshBody = true;
            }
        }
        else {
            if (!myDate) {
                myDate = new Date();
                $actualDate = myDate;
            }
        }
    }

    /**
     * 月份补0
     * @param target
     * @returns {*}
     */
    function formatMonth(target) {
        if (target < 9) {
            target = "0" + (target + 1);
        }
        else {
            target = target + 1;
        }
        return target;
    }

    /**
     * 日补0
     */
    function formatDate(target) {
        if (typeof target != "number") {
            target = parseInt(target);
        }
        if (target < 10) {
            target = "0" + (target);
        }
        return target;
    }

    /**
     * 获取星期
     */
    function formatDay(_day) {
        switch (_day) {
            case 0:
                _day = "星期日";
                break;
            case 1:
                _day = "星期一";
                break;
            case 2:
                _day = "星期二";
                break;
            case 3:
                _day = "星期三";
                break;
            case 4:
                _day = "星期四";
                break;
            case 5:
                _day = "星期五";
                break;
            case 6:
                _day = "星期六";
                break;
        }
        return _day;
    }

    /**
     * 转换显示的完整日期
     * @param target
     * @returns {string}
     */
    function getCompleteDate(target) {
        if (!target) {
            target = new Date();
        }
        var month = formatMonth(target.getMonth());
        var _date = formatDate(target.getDate());
        var _day = formatDay(target.getDay());
        return target.getFullYear() + "-" + month + "-" + _date + " " + _day;
    }

    /**
     * 根据日期获取年月
     * @param target
     * @returns {string}
     */
    function getYearAndMonth(target) {
        if (!target) {
            target = new Date();
        }
        var month = target.getMonth();
        if (month < 9) {
            month = "0" + (month + 1);
        }
        else {
            month = month + 1;
        }
        return target.getFullYear() + "-" + month;
    }

    /**
     * 初始化日历主体
     */
    function initCalendarBody() {
        $content = document.createElement("div");
        addClass($content, "div_calendar_body");
        $elem.appendChild($content);
        addCalendarHead();

        //日期计算bug，例：2017-01
        var num = 0;
        do {
            var length = 0;
            if (num == 0) {
                //出星期天外，星期数(1~6)和第一行显示的日期数(7~2)，相加的结果都为8
                length = firstWeekDay == 0 ? 1 : 8 - firstWeekDay;
                num = length;
                createLine(length - 1, 1);
            }
            else {
                var length = mds - num > 6 ? 7 : mds - num;
                num = num + length;
                createLine(length - 1);
            }
        }
        while (num < mds)
        showCurrentDate();
    }

    /**
     * 计算1号星期X
     * @returns {number|*}
     */
    function getfirstWeekDay() {
        result = day - (date % 7 - 1);
        return result < 0 ? 7 + result : result;
    }

    /**
     * 根据年月查询当月天数
     * @param Year
     * @param Month
     * @returns {number}
     * @constructor
     */
    function DayNumOfMonth(Year, Month) {
        Month--;
        var d = new Date(Year, Month, 1);
        d.setDate(d.getDate() + 32 - d.getDate());
        return (32 - d.getDate());
    }

    /**
     * 日历头部
     * @param calendar_div
     */
    function addCalendarHead() {
        var newDiv = document.createElement("div");
        var calendarHeads = ["一", "二", "三", "四", "五", "六", "日"];
        for (var i = 0; i < calendarHeads.length; i++) {
            var newspan = document.createElement("span");
            var span_text = document.createTextNode(calendarHeads[i]);
            newspan.appendChild(span_text);
            newDiv.appendChild(newspan);
        }
        $content.appendChild(newDiv);
    }

    /**
     * 创建一行数据
     * @param num 当前行的span数量
     * type:1为首行，2为末行
     */
    function createLine(num, type) {
        var newDiv = document.createElement("div");
        for (var i = 0; i <= num; i++, index++) {
            var span = document.createElement("span");
            var span_text = document.createTextNode(index + 1);
            //单个日期元素的操作
            if (attendances && attendances.length > 0) {
                bindAttendance(span, attendances[index]);
            }
            span.appendChild(span_text);
            newDiv.appendChild(span);
        }
        if (type == 1) {
            addClass(newDiv, "first_div")
        }
        else {
            addClass(newDiv, "last_div")
        }
        $content.appendChild(newDiv);
    }

    /**
     * 绑定考勤记录
     * @param span 日元素
     * @param attendance 日考勤对象
     */
    function bindAttendance(span, attendance) {
        if (attendance) {
            span.onclick = function () {
                var spans = document.getElementsByClassName("select");
                if (spans && spans.length > 0) {
                    spans[0].className = spans[0].className.replace("select", "").trim();
                }
                addClass(this, "select");
                var _date = formatDate(parseInt(this.id) + 1);
                myDate = convertDateFromString(currentYM + "-" + _date);
                showCurrentDate();
            }
            span.setAttribute("id", attendance.day);
            var actual_ym = getYearAndMonth(new Date());
            var actual_date = $actualDate.getDate();
            var ym = getYearAndMonth(myDate);
            if (actual_ym == ym && attendance.day == actual_date - 1) {
                addClass(span, "today");
            }
            else {
                switch (attendance.status) {
                    case 0:
                        addClass(span, "normal");
                        break;
                    case 1:
                        addClass(span, "late");
                        break;
                    case 2:
                        addClass(span, "absense");
                        break;
                }
            }
        }
    }

    /**
     * 显示当前年月
     */
    function showCurrentDate() {
        if (!showCurrentDateFlag) return;
        if (target_lable) {
            document.getElementById(target_lable).innerText = getCompleteDate(myDate);
        }
        else {
            if (document.getElementById("currentDate_text")) {
                var text = document.getElementById("currentDate_text")
                text.innerHTML = getCompleteDate(myDate);
            }
            else {
                var currentDiv = document.createElement("div");
                addClass(currentDiv, "div_currentDate");
                span = document.createElement("span");
                span.setAttribute("id", "currentDate_label");
                var em_title = document.createElement("em");
                var em_text = document.createTextNode("当前年月:");
                em_title.appendChild(em_text);
                var em_date = document.createElement("em");
                var currentdate_text = getCompleteDate(myDate);
                var em_date_text = document.createTextNode(currentdate_text);
                em_date.setAttribute("id", "currentDate_text");
                em_date.appendChild(em_date_text);
                span.appendChild(em_title);
                span.appendChild(em_date);
                currentDiv.appendChild(span);
                $content.appendChild(currentDiv);
            }
        }
    }


    /**
     * string转date
     * @param dateString
     * @returns {Date}
     */
    function convertDateFromString(dateString) {
        if (dateString) {
            var date = new Date(dateString.replace(/-/, "/"))
            return date;
        }
    }

    /**
     * 添加左边翻动按钮，向前一个月
     */
    function addLeftBtn() {
        $left = document.createElement("div");
        var span = document.createElement("span");
        var span_text = document.createTextNode("<");
        addClass(span, "changeDate");
        span.appendChild(span_text);
        span.setAttribute("title", "上个月");
        span.onclick = function () {
            upMonth();
        }
        $left.appendChild(span);
        $elem.appendChild($left);

    }

    /**
     * 添加右边翻动按钮，向后一个月
     */
    function addRightBtn() {
        $right = document.createElement("div");
        var span = document.createElement("span");
        var span_text = document.createTextNode(">");
        addClass(span, "changeDate");
        span.setAttribute("title", "下个月");
        span.onclick = function () {
            nextMonth();
        }
        span.appendChild(span_text);
        $right.appendChild(span);
        $elem.appendChild($right);
    }

    /**
     * 下个月
     */
    function nextMonth() {
        myDate.setMonth(myDate.getMonth() + 1);
        initCalendar();
    }

    /**
     * 上个月
     */
    function upMonth() {
        myDate.setMonth(myDate.getMonth() - 1);
        initCalendar();
    }

    /**
     * 给指定的element追加样式
     * @param element
     * @param value
     */
    function addClass(element, value) {
        if (!element.className) {
            element.className = value;
        }
        else {
            var newClass = element.className;
            newClass += " ";
            newClass += value;
            element.className = newClass;
        }
    }
}


/**** 此为测试js部分 测试日历start  *****/
new AttendanceCalendar("calendar_div", getData,"current_date_label");

/**
 * @param ym ni月
 * @returns {Array}
 */
function getData(ym) {
    var attendances = [];
    for (var i = 0; i < 30; i++) {
        var num = GetRandomNum(0, 2);
        attendances.push({day: i, status: num});
    }
    return attendances;
}

function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}
/**** 此为测试js部分 测试日历  *****/
// console.log(DayNumOfMonth(2016, 2));

