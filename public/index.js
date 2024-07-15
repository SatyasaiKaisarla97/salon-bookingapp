const API_URL = "http://localhost:3000/api";
let token = localStorage.getItem("token");
let userRole = localStorage.getItem("userRole");

const router = () => {
  const path = window.location.hash.slice(1) || "/";
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = "";

  switch (path) {
    case "/":
      renderHome();
      break;
    case "/login":
      renderLogin();
      break;
    case "/signup":
      renderSignup();
      break;
    case "/services":
      renderServices();
      break;
    case "/appointments":
      renderAppointments();
      break;
    case "/book":
      renderBooking();
      break;
    default:
      mainContent.innerHTML = "<h2>404 Not Found</h2>";
  }

  updateNavLinks();
};

const updateNavLinks = () => {
  const navLinks = document.getElementById("nav-links");
  navLinks.innerHTML = "";

  if (token) {
    navLinks.innerHTML += `
            <a href="#/services">Services</a>
            <a href="#/appointments">My Appointments</a>
            <a href="#/book">Book Appointment</a>
            <a href="#" onclick="logout()">Logout</a>
        `;
    if (userRole === "admin") {
      navLinks.innerHTML += `<a href="#/admin">Admin Dashboard</a>`;
    }
  } else {
    navLinks.innerHTML += `
            <a href="#/login">Login</a>
            <a href="#/signup">Sign Up</a>
        `;
  }
};

const renderHome = () => {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = "<h2>Welcome to our Salon Booking System</h2>";
};

const renderLogin = () => {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
        <h2>Login</h2>
        <form id="login-form">
            <input type="email" id="login-email" placeholder="Email" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `;
  document.getElementById("login-form").addEventListener("submit", handleLogin);
};

const renderSignup = () => {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
        <h2>Sign Up</h2>
        <form id="signup-form">
            <input type="text" id="signup-name" placeholder="Name" required>
            <input type="email" id="signup-email" placeholder="Email" required>
            <input type="password" id="signup-password" placeholder="Password" required>
            <button type="submit">Sign Up</button>
        </form>
    `;
  document
    .getElementById("signup-form")
    .addEventListener("submit", handleSignup);
};

const renderServices = async () => {
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML =
    '<h2>Our Services</h2><div class="service-list"></div>';
  const serviceList = mainContent.querySelector(".service-list");

  try {
    const response = await axios.get(`${API_URL}/services`);
    response.data.forEach((service) => {
      serviceList.innerHTML += `
                <div class="service-card">
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                    <p>Duration: ${service.duration} minutes</p>
                    <p>Price: $${service.price}</p>
                </div>
            `;
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    mainContent.innerHTML +=
      "<p>Error loading services. Please try again later.</p>";
  }
};

const renderAppointments = async () => {
  if (!token) {
    window.location.hash = "#/login";
    return;
  }

  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML =
    '<h2>My Appointments</h2><div class="appointment-list"></div>';
  const appointmentList = mainContent.querySelector(".appointment-list");

  try {
    const response = await axios.get(`${API_URL}/appointments/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    response.data.forEach((appointment) => {
      appointmentList.innerHTML += `
                <div class="appointment-card">
                    <h3>Appointment on ${new Date(
                      appointment.dateTime
                    ).toLocaleString()}</h3>
                    <p>Status: ${appointment.status}</p>
                    <button onclick="cancelAppointment(${
                      appointment.id
                    })">Cancel</button>
                </div>
            `;
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    mainContent.innerHTML +=
      "<p>Error loading appointments. Please try again later.</p>";
  }
};

const renderBooking = async () => {
  if (!token) {
    window.location.hash = "#/login";
    return;
  }

  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
        <h2>Book an Appointment</h2>
        <form id="booking-form">
            <select id="service-select" required>
                <option value="">Select a service</option>
            </select>
            <select id="staff-select" required>
                <option value="">Select a staff member</option>
            </select>
            <input type="datetime-local" id="appointment-datetime" required>
            <button type="submit">Book Appointment</button>
        </form>
    `;

  try {
    const [servicesResponse, staffResponse] = await Promise.all([
      axios.get(`${API_URL}/services`),
      axios.get(`${API_URL}/staff`),
    ]);

    const serviceSelect = document.getElementById("service-select");
    servicesResponse.data.forEach((service) => {
      serviceSelect.innerHTML += `<option value="${service.id}">${service.name}</option>`;
    });

    const staffSelect = document.getElementById("staff-select");
    staffResponse.data.forEach((staff) => {
      staffSelect.innerHTML += `<option value="${staff.id}">${staff.User.name}</option>`;
    });

    document
      .getElementById("booking-form")
      .addEventListener("submit", handleBooking);
  } catch (error) {
    console.error("Error loading booking form data:", error);
    mainContent.innerHTML +=
      "<p>Error loading booking form. Please try again later.</p>";
  }
};

const handleLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    token = response.data.token;
    userRole = response.data.role;
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", userRole);
    window.location.hash = "#/";
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please check your credentials and try again.");
  }
};

const handleSignup = async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await axios.post(`${API_URL}/auth/signup`, { name, email, password });
    alert("Signup successful. Please log in.");
    window.location.hash = "#/login";
  } catch (error) {
    console.error("Signup error:", error);
    alert("Signup failed. Please try again.");
  }
};

const handleBooking = async (e) => {
  e.preventDefault();
  const serviceId = document.getElementById("service-select").value;
  const staffId = document.getElementById("staff-select").value;
  const dateTime = document.getElementById("appointment-datetime").value;

  try {
    await axios.post(
      `${API_URL}/appointments`,
      { serviceId, staffId, dateTime },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert("Appointment booked successfully!");
    window.location.hash = "#/appointments";
  } catch (error) {
    console.error("Booking error:", error);
    alert("Booking failed. Please try again.");
  }
};

const cancelAppointment = async (appointmentId) => {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    try {
      await axios.post(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Appointment cancelled successfully!");
      renderAppointments();
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Cancellation failed. Please try again.");
    }
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  token = null;
  userRole = null;
  window.location.hash = "#/";
};

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
