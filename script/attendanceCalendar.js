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
 *
 */
function AttendanceCalendar(_obj, _fn) {
    var $elem;
    var $content;
    var getDataFn;
    var $left, $right;
    var myDate;                 //当前日期
    var date;                   //当前日(1-31)
    var day;                    //当前星期X(0-6,0代表星期天)
    var firstWeekDay;          //1号星期X
    var mds;                   //当月天数
    var index = 0;             //索引(若是需要对日历的属性进行赋值，该索引可直接作为数组索引)
    var attendances = [];
    var hasMoveButton = false;  //是否开启日历上下月翻动按钮
    var refreshBody = false;

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
            }
        }
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
        createLine(7 - firstWeekDay, 1);
        createLine(6);
        createLine(6);
        createLine(6);
        createLine(mds - 21 - (7 - firstWeekDay + 1) - 1, 2);
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
        if (type == 2) {
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
            span.setAttribute("id", attendance.day);
            var actual_ym = getYearAndMonth(new Date());
            var ym = getYearAndMonth(myDate);
            if (actual_ym == ym && attendance.day == date - 1) {
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
        var currentDiv = document.createElement("div");
        addClass(currentDiv, "div_currentDate");
        var span = document.createElement("span");

        var em_title = document.createElement("em");
        var em_text = document.createTextNode("当前年月:");
        em_title.appendChild(em_text);

        var em_date = document.createElement("em");
        var currentdate_text = getYearAndMonth(myDate);
        var em_date_text = document.createTextNode(currentdate_text);
        em_date.appendChild(em_date_text);

        span.appendChild(em_title);
        span.appendChild(em_date);
        currentDiv.appendChild(span);
        $content.appendChild(currentDiv);
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
new AttendanceCalendar("calendar_div", getData);

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

