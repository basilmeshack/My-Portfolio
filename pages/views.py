from django.shortcuts import render

# Pages views
def home(request):
    return render(request, "pages/home.html", {})
