from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from math import pow

app = Flask(__name__)
app.secret_key = "supersecretkey"  # Needed for session management

# --- In-memory user storage (replace with DB for production) ---
users = {}

# --- Routes ---

# Index page (main dashboard)
@app.route("/")
def index():
    if "user" not in session:
        return redirect(url_for("login"))
    return render_template("index.html")

# Login page
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        user = users.get(email)
        if user and user["password"] == password:
            session["user"] = user["name"]
            return redirect(url_for("index"))
        return render_template("login.html", error="Invalid credentials")
    return render_template("login.html")

# Register page
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        if email in users:
            return render_template("register.html", error="User already exists")
        users[email] = {"name": name, "password": password}
        session["user"] = name
        return redirect(url_for("index"))
    return render_template("register.html")

# Logout
@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("login"))

# --- API Endpoints ---

# Loan calculation
@app.route("/add_loan", methods=["POST"])
def add_loan():
    try:
        amount = float(request.form.get("amount", 0))
        interest = float(request.form.get("interest", 0))
        term = int(request.form.get("term", 1))

        r = interest / 100 / 12  # monthly interest rate
        n = term  # months

        if r == 0:
            monthly_payment = amount / n
        else:
            monthly_payment = (amount * r) / (1 - pow(1 + r, -n))

        weekly_payment = monthly_payment / 4.345
        yearly_payment = monthly_payment * 12

        return jsonify({
            "monthly": round(monthly_payment, 2),
            "weekly": round(weekly_payment, 2),
            "yearly": round(yearly_payment, 2)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Savings calculation
@app.route("/add_savings", methods=["POST"])
def add_savings():
    try:
        initial = float(request.form.get("initial", 0))
        monthly = float(request.form.get("monthly", 0))
        interest = float(request.form.get("interest", 0))
        years = int(request.form.get("years", 1))

        r = interest / 100  # annual interest rate
        labels = []
        values = []

        total = initial
        for year in range(1, years + 1):
            total = total * (1 + r) + monthly * 12 * (1 + r)
            labels.append(f"Year {year}")
            values.append(round(total, 2))

        return jsonify({
            "labels": labels,
            "values": values
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- CTA login/register form (optional endpoint if needed) ---
@app.route("/register_or_login", methods=["POST"])
def register_or_login():
    email = request.form.get("email")
    password = request.form.get("password", "1234")  # default for demo
    name = request.form.get("name", "User")

    if email in users:
        # Login flow
        if users[email]["password"] == password:
            session["user"] = users[email]["name"]
            return jsonify({"success": True, "username": users[email]["name"]})
        return jsonify({"success": False, "message": "Invalid credentials"})
    else:
        # Register flow
        users[email] = {"name": name, "password": password}
        session["user"] = name
        return jsonify({"success": True, "username": name})

# --- Run app ---
if __name__ == "__main__":
    app.run()