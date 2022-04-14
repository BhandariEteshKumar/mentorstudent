export function checkBooking(arr, start, end, flag) {
  arr.forEach((element) => {
    var startdb = new Date(element.date + " " + element.StartTime);
    var enddb = new Date(element.date + " " + element.EndTime);
    if (
      startdb.getTime() === start.getTime() ||
      enddb.getTime() === end.getTime()
    ) {
      flag = false;
    }
  });
  return flag;
}
