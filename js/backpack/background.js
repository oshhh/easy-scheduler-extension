function getDurationStr(duration, durationUnit) {
    if (durationUnit === "days") {
        return (`${duration}-0-0`);
    }
    else if (durationUnit === "hours") {
        return (`0-${duration}-0`);
    }
}

function getScheduleStr(dateStr) {
    var dateComp = dateStr.split('/');
    var scheduleDateStr = `${dateComp[2]}-${dateComp[1]}-${dateComp[0]}`;
    var scheduleTimeStr = "00:00:00.000Z";
    var scheduleStr = `${scheduleDateStr}T${scheduleTimeStr}`;
    return (scheduleStr);
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isQuizAnnouncement(content) {
    var examSynonyms = ['quiz', 'assessment', 'examination', 'test', 'exam', 'midsem', 'endsem'];
    var words = content.toLowerCase().split(' ');
    for (let word of words) {
        if (word == ' ')
            continue;
        var cleanWord = "";
        var chars = word.split('');
        for (let char of chars) {
            if (isLetter(char)) {
                cleanWord += char;
            }
        }
        if (examSynonyms.includes(cleanWord))
            return (true);
    }
    return (false);
}

function extractDate(content) {
    request = `${DEADLINE_SCHEDULING_SUGGESTION_API}/${COLLEGE_NAME}/find_date/${content}`;
    return fetch_(request);
}

function getAnnouncementContentFromMessage(title, text) {
    if (title === null || title === undefined)
        title = "";
    if (text === null || text === undefined)
        text = "";
    var text = text.replace(/(<([^>]+)>)/gi, "");
    text = text.replace(new RegExp("&nbsp;", "g"), ' ');

    var content = title + " " + text;
    return (content);
}

function checkAnnouncementTags(title, text, callback) {
    var content = getAnnouncementContentFromMessage(title, text);
    if (isQuizAnnouncement(content)) {
        extractDate(content).then((date) => {
            date.text().then((date) => {
                date = new Date(date);
                tags = [{
                    name: 'Exam Announcement',
                    attr1: date.getTime()
                }
                ];
                callback(tags)
            })
        }).catch ((err) => {
            console.log(err)
            tags = [{
                name: 'Exam Announcement',
                attr1: null
            }
            ];
            callback(tags)
            })
    } else {
        callback([])
    }
}

// Inform the API regarding the upcoming quiz
function informAboutQuiz(date) {
    var dateParts = date.split("/");

    var start_date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])

    var end_date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    end_date.setHours(end_date.getHours() + 1)

    var request = `${DEADLINE_SCHEDULING_SUGGESTION_API}/${COLLEGE_NAME}/inform_about_event/quiz/${course_name}/${start_date.toISOString()}/${end_date.toISOString()}`
    console.log(request)
    fetch_(request).then((response) => {
        return response.text();
    }).then((res) => {
        console.log(res)
    })
}

function informAboutDeadline(date) {
    var start_date = new Date()

    var dateParts = date.split("/");
    var end_date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])

    var request = `${DEADLINE_SCHEDULING_SUGGESTION_API}/${COLLEGE_NAME}/inform_about_event/backpack_deadline/${course_name}/${start_date.toISOString()}/${end_date.toISOString()}`
    console.log(request)
    fetch_(request).then((response) => {
        return response.text();
    }).then((res) => {
        console.log(res)
    })

}

function informAboutDeadlineReminder(start_date, end_date) {
    var dateParts = start_date.split("/");
    var start_date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])

    dateParts = end_date.split("/");
    var end_date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])

    var request = `${DEADLINE_SCHEDULING_SUGGESTION_API}/${COLLEGE_NAME}/inform_about_event/backpack_deadline_reminder/${course_name}/${start_date.toISOString()}/${end_date.toISOString()}`
    console.log(request)
    fetch_(request).then((response) => {
        return response.text();
    }).then((res) => {
        alert(res)
        unsetCreateReminderLoadingState()
    })
}

function fetchSuggestions(days, hours, minDueDate, maxDueDate) {
    var durationStr = `${days}-${hours}-0`;
    var minScheduleStr = getScheduleStr(minDueDate);
    var maxScheduleStr = getScheduleStr(maxDueDate);

    // API call fetch schedules

    var request=`${DEADLINE_SCHEDULING_SUGGESTION_API}/${COLLEGE_NAME}/get_suggestions/${course_name}/${durationStr}/${minScheduleStr}/${maxScheduleStr}`;
    console.log(request);
    return fetch_(request);
}