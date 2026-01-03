from datetime import date, timedelta

today = date.today()
this_month_first = date(today.year, today.month, 1)
prev_month_last = this_month_first - timedelta(days=1)
prev_month_first = date(prev_month_last.year, prev_month_last.month, 1)

print(f"today={today}")
print(f"prev_month_first={prev_month_first}")
print(f"prev_month_last={prev_month_last}")
print(f"label={prev_month_first.strftime('%B %Y')}")
