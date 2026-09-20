/* ==========================================
   APEX PEAK SWIMMING ACADEMY
   MAIN JAVASCRIPT
========================================== */


/* ==========================================
   LOAD HTML COMPONENTS
========================================== */

async function loadComponent(elementId, filePath) {
    const container = document.getElementById(elementId);

    if (!container) {
        return;
    }

    try {
        const response = await fetch(filePath);

        if (!response.ok) {
            throw new Error(`Unable to load component: ${filePath}`);
        }

        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error(error);
    }
}


/* ==========================================
   LOAD NAVBAR
========================================== */

async function loadNavbar() {
    await loadComponent("navbar-container", "components/navbar.html");
}


/* ==========================================
   LOAD FOOTER
========================================== */

async function loadFooter() {
    await loadComponent("footer-container", "components/footer.html");
}


/* ==========================================
   CURRENT YEAR
========================================== */

function setCurrentYear() {
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
}


/* ==========================================
   BACK TO TOP BUTTON
========================================== */

function setupBackToTop() {
    const backToTop = document.getElementById("backToTop");

    if (!backToTop) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* ==========================================
   NAVBAR SCROLL EFFECT
========================================== */

function setupNavbarScroll() {
    const navbar = document.querySelector(".site-header .navbar");

    if (!navbar) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}


/* ==========================================
   MOBILE NAVBAR
========================================== */

function setupMobileNavbar() {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase() || "index.html";

    const navLinks = document.querySelectorAll(".site-header .nav-link");

    navLinks.forEach((link) => {
        const linkPage = link.getAttribute("href");

        if (!linkPage) {
            return;
        }

        const cleanLinkPage = linkPage
            .split("#")[0]
            .toLowerCase();

        link.classList.remove("active");
        link.removeAttribute("aria-current");

        if (cleanLinkPage === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}


/* ==========================================
   FORM VALIDATION & SUBMISSION
========================================== */

function getFieldErrorContainer(field) {
    const group = field.closest(".registration-form-group");

    if (!group) {
        return null;
    }

    let errorContainer = group.querySelector(".field-error-message");

    if (!errorContainer) {
        errorContainer = document.createElement("div");
        errorContainer.className = "field-error-message text-danger small mt-1";
        group.appendChild(errorContainer);
    }

    return errorContainer;
}

function clearFieldError(field) {
    if (!field) {
        return;
    }

    field.classList.remove("is-invalid");

    const errorContainer = getFieldErrorContainer(field);
    if (errorContainer) {
        errorContainer.textContent = "";
    }
}

function clearFormErrors(form) {
    form.querySelectorAll(".is-invalid").forEach((input) => {
        input.classList.remove("is-invalid");
    });

    form.querySelectorAll(".field-error-message").forEach((message) => {
        message.textContent = "";
    });
}

function setFieldError(field, message) {
    if (!field) {
        return;
    }

    field.classList.add("is-invalid");

    const errorContainer = getFieldErrorContainer(field);
    if (errorContainer) {
        errorContainer.textContent = message;
    }
}

function showFormAlert(form, message, type = "success") {
    const existingAlert = form.parentElement.querySelector(".form-status-alert");
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement("div");
    alert.className = `alert form-status-alert ${type === "error" ? "alert-danger" : "alert-success"} mt-3`;
    alert.textContent = message;
    form.parentElement.insertBefore(alert, form.nextSibling);
}

function normalizeCheckboxValues(fieldName, form) {
    const selectedValues = Array.from(
        form.querySelectorAll(`input[name="${fieldName}"]`)
    )
        .filter((input) => input.checked)
        .map((input) => input.value);

    return selectedValues.length > 0 ? selectedValues : "";
}

function collectRegistrationPayload(form) {
    const payload = {};
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
        if (key === "available_days" || key === "experience" || key === "medical_conditions" || key === "program_policies") {
            if (!payload[key]) {
                payload[key] = [];
            }

            payload[key].push(value);
            continue;
        }

        if (key === "dob") {
            payload.date_of_birth = value;
            continue;
        }

        payload[key] = value;
    }

    ["available_days", "experience", "medical_conditions", "program_policies"].forEach((fieldName) => {
        if (payload[fieldName]) {
            payload[fieldName] = Array.isArray(payload[fieldName])
                ? payload[fieldName].join(", ")
                : payload[fieldName];
        }
    });

    return payload;
}

function validateRegistrationForm(form) {
    const errors = {};
    const fields = Array.from(form.elements).filter((element) => {
        return element.name && !element.disabled;
    });

    fields.forEach((field) => {
        if (field.type === "radio") {
            const radioGroup = form.querySelectorAll(`input[name="${field.name}"]`);
            const isRequired = field.hasAttribute("required");

            if (isRequired && !Array.from(radioGroup).some((radio) => radio.checked)) {
                errors[field.name] = "This field is required.";
                setFieldError(field, errors[field.name]);
            }

            return;
        }

        if (field.type === "checkbox" && field.hasAttribute("required")) {
            const checkboxGroup = form.querySelectorAll(`input[name="${field.name}"]`);
            const hasSelection = Array.from(checkboxGroup).some((checkbox) => checkbox.checked);

            if (!hasSelection) {
                errors[field.name] = "This field is required.";
                setFieldError(field, errors[field.name]);
            }

            return;
        }

        if (field.hasAttribute("required") && field.value.trim() === "") {
            errors[field.name] = "This field is required.";
            setFieldError(field, errors[field.name]);
        }

        if (field.name.toLowerCase().includes("email") || field.type === "email") {
            const value = field.value.trim();
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors[field.name] = "Please enter a valid email address.";
                setFieldError(field, errors[field.name]);
            }
        }

        if (field.name.toLowerCase().includes("password") && field.value.trim().length > 0 && field.value.trim().length < 8) {
            errors[field.name] = "Password must be at least 8 characters long.";
            setFieldError(field, errors[field.name]);
        }
    });

    return errors;
}

async function submitRegistrationForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    if (!form || !submitButton) {
        return;
    }

    clearFormErrors(form);
    const validationErrors = validateRegistrationForm(form);

    if (Object.keys(validationErrors).length > 0) {
        showFormAlert(form, "Please correct the highlighted fields before submitting.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';

    try {
        const payload = collectRegistrationPayload(form);

        const response = await fetch("http://localhost:5000/api/registrations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (data.errors && Object.keys(data.errors).length > 0) {
                Object.entries(data.errors).forEach(([fieldName, message]) => {
                    const field = form.elements[fieldName];
                    if (field) {
                        setFieldError(field, message);
                    }
                });
            }

            showFormAlert(form, data.message || "Registration failed. Please try again.", "error");
            return;
        }

        form.reset();

        const referenceNumber = data.reference_number || "";
        const successMessage = referenceNumber
            ? `Registration Submitted Successfully!<br><strong>Your Registration Reference Number: ${referenceNumber}</strong><br>Please save this reference number. You will need it to view or make changes to your registration later.`
            : (data.message || "Registration submitted successfully!");

        const existingAlert = form.parentElement.querySelector(".form-status-alert");
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement("div");
        alert.className = "alert form-status-alert alert-success mt-3";
        alert.innerHTML = successMessage;
        form.parentElement.insertBefore(alert, form.nextSibling);
    } catch (error) {
        console.error(error);
        showFormAlert(form, "There was a problem submitting your registration. Please try again.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-check-circle me-2"></i> Submit Registration';
    }
}

async function fetchRegistrations() {
    const useDemoSession = localStorage.getItem("apexPeakAdminSession") === "true";

    const response = await fetch("http://localhost:5000/api/registrations", {
        credentials: "include",
        headers: {
            "X-Admin-Demo": useDemoSession ? "true" : "false"
        }
    });

    if (!response.ok) {
        throw new Error("Unable to load registrations.");
    }

    return response.json();
}

function renderAdminDashboard(registrations) {
    const tableBody = document.getElementById("adminRegistrationTableBody");
    const total = document.getElementById("totalRegistrations");
    const approved = document.getElementById("approvedRegistrations");
    const pending = document.getElementById("pendingRegistrations");
    const searchInput = document.getElementById("registrationSearchInput");
    const statusFilter = document.getElementById("registrationStatusFilter");

    if (!tableBody) {
        return;
    }

    const searchTerm = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const selectedStatus = statusFilter ? statusFilter.value : "all";

    const filteredRegistrations = registrations.filter((entry) => {
        const fullName = (entry.full_name || "").toLowerCase();
        const email = (entry.email || "").toLowerCase();
        const status = (entry.status || "pending").toLowerCase();

        const matchesSearch = !searchTerm || fullName.includes(searchTerm) || email.includes(searchTerm);
        const matchesStatus = selectedStatus === "all" || status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    const totalCount = registrations.length;
    const approvedCount = registrations.filter((entry) => (entry.status || "pending").toLowerCase() === "approved").length;
    const pendingCount = registrations.filter((entry) => (entry.status || "pending").toLowerCase() === "pending").length;

    if (total) total.textContent = String(totalCount);
    if (approved) approved.textContent = String(approvedCount);
    if (pending) pending.textContent = String(pendingCount);

    if (!filteredRegistrations.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    No registrations match the current filters.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredRegistrations
        .map((entry, index) => {
            const status = (entry.status || "pending").toLowerCase();
            const badgeClass = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <strong>${entry.full_name || "Unnamed participant"}</strong><br>
                        <small class="text-muted">${entry.parent_name || "No guardian provided"}</small>
                    </td>
                    <td>${entry.email || "—"}</td>
                    <td>${entry.participant_type || "—"}</td>
                    <td>${entry.age || "—"}</td>
                    <td>
                        <span class="status-badge ${badgeClass}">${status}</span>
                    </td>
                    <td>
                        <div class="status-actions">
                            <button
                                type="button"
                                class="btn btn-sm btn-success status-action"
                                data-id="${entry.id}"
                                data-status="approved"
                                ${status === "approved" ? "disabled" : ""}
                            >
                                Approve
                            </button>
                            <button
                                type="button"
                                class="btn btn-sm btn-outline-danger status-action"
                                data-id="${entry.id}"
                                data-status="rejected"
                                ${status === "rejected" ? "disabled" : ""}
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                class="btn btn-sm btn-outline-dark delete-registration-button"
                                data-id="${entry.id}"
                                data-action="delete"
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                class="btn btn-link btn-sm detail-link"
                                data-id="${entry.id}"
                                data-action="detail"
                            >
                                View
                            </button>
                        </div>
                    </td>
                    <td>${entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "—"}</td>
                </tr>
            `;
        })
        .join("");

    document.querySelectorAll(".status-action").forEach((button) => {
        button.addEventListener("click", async () => {
            const id = button.dataset.id;
            const nextStatus = button.dataset.status;

            try {
                const useDemoSession = localStorage.getItem("apexPeakAdminSession") === "true";

                const response = await fetch(`http://localhost:5000/api/registrations/${id}/status`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Admin-Demo": useDemoSession ? "true" : "false"
                    },
                    body: JSON.stringify({ status: nextStatus })
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || "Unable to update registration status.");
                }

                const refreshed = await fetchRegistrations();
                renderAdminDashboard(refreshed);
            } catch (error) {
                console.error(error);
                alert(error.message || "Unable to update status.");
            }
        });
    });

    let registrationToDeleteId = null;
    const deleteRegistrationModal = document.getElementById("deleteRegistrationModal");
    const confirmDeleteRegistrationButton = document.getElementById("confirmDeleteRegistrationButton");

    document.querySelectorAll(".delete-registration-button").forEach((button) => {
        button.addEventListener("click", () => {
            registrationToDeleteId = button.dataset.id;
            const modal = new bootstrap.Modal(deleteRegistrationModal);
            modal.show();
        });
    });

    if (confirmDeleteRegistrationButton) {
        confirmDeleteRegistrationButton.addEventListener("click", async () => {
            if (!registrationToDeleteId) {
                return;
            }

            const isLocalDemoSession = localStorage.getItem("apexPeakAdminSession") === "true";

            try {
                const sessionResponse = await fetch("http://localhost:5000/api/admin/session", {
                    credentials: "include"
                });

                const sessionData = await sessionResponse.json().catch(() => ({}));

                if (!sessionResponse.ok || !sessionData.authenticated) {
                    if (!isLocalDemoSession) {
                        localStorage.removeItem("apexPeakAdminSession");
                        localStorage.removeItem("apexPeakAdminEmail");
                        window.location.href = "Admin-Login.html";
                        return;
                    }
                }

                const response = await fetch(`http://localhost:5000/api/registrations/${registrationToDeleteId}`, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "X-Admin-Demo": isLocalDemoSession ? "true" : "false"
                    }
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(data.message || "Unable to delete registration.");
                }

                const refreshed = await fetchRegistrations();
                renderAdminDashboard(refreshed);
                alert(data.message || "Registration deleted successfully.");

                const modal = bootstrap.Modal.getInstance(deleteRegistrationModal);
                if (modal) {
                    modal.hide();
                }

                registrationToDeleteId = null;
            } catch (error) {
                console.error(error);
                alert(error.message || "Your admin session has expired. Please log in again.");
                localStorage.removeItem("apexPeakAdminSession");
                localStorage.removeItem("apexPeakAdminEmail");
                window.location.href = "Admin-Login.html";
            }
        });
    }

    function populateReadOnlyRegistrationForm(form, entry) {
        const setValue = (name, value) => {
            if (!name) {
                return;
            }

            const field = form.querySelector(`[name="${name}"]`);
            if (!field) {
                return;
            }

            if (field.type === "radio") {
                field.checked = String(field.value) === String(value ?? "");
                return;
            }

            if (field.type === "checkbox") {
                const values = Array.isArray(value) ? value : String(value || "").split(",");
                const normalized = values.map((item) => String(item).trim());
                field.checked = normalized.includes(String(field.value).trim());
                return;
            }

            field.value = value ?? "";
        };

        const setMultiValue = (name, value) => {
            const values = Array.isArray(value) ? value : String(value || "").split(",");
            values.forEach((item) => {
                const field = form.querySelector(`[name="${name}"][value="${String(item).trim()}"]`);
                if (field) {
                    field.checked = true;
                }
            });
        };

        const textFields = [
            "full_name",
            "date_of_birth",
            "age",
            "gender",
            "home_address",
            "school",
            "parent_name",
            "relationship",
            "phone",
            "email",
            "emergency_name",
            "emergency_relationship",
            "emergency_phone",
            "experience_other",
            "medical_other",
            "medical_details",
            "current_medications",
            "physician",
            "physician_phone",
            "health_declaration",
            "health_declaration_doc",
            "photo_consent",
            "emergency_medical_consent",
            "acknowledgement_risk",
            "liability_waiver",
            "declaration_agree",
            "parent_signature",
            "today_date",
            "swimmer_photo"
        ];

        textFields.forEach((name) => {
            if (entry[name] !== undefined) {
                setValue(name, entry[name]);
            }
        });

        [
            { name: "participant_type", value: entry.participant_type },
            { name: "gender", value: entry.gender }
        ].forEach(({ name, value }) => {
            if (value !== undefined && value !== null && value !== "") {
                setValue(name, value);
            }
        });

        [
            { name: "available_days", value: entry.available_days },
            { name: "experience", value: entry.experience },
            { name: "medical_conditions", value: entry.medical_conditions },
            { name: "program_policies", value: entry.program_policies }
        ].forEach(({ name, value }) => {
            if (value) {
                setMultiValue(name, value);
            }
        });

        const allInputs = form.querySelectorAll("input, textarea, select");
        allInputs.forEach((input) => {
            input.disabled = true;
            input.setAttribute("readonly", "readonly");
        });
    }

    function showRegistrationViewer(entry) {
        const dashboard = document.querySelector(".admin-dashboard-page");
        const topNav = document.getElementById("navbar-container");
        const siteFooter = document.getElementById("footer-container");

        if (dashboard) {
            dashboard.style.display = "none";
        }

        if (topNav) {
            topNav.style.display = "none";
        }

        if (siteFooter) {
            siteFooter.style.display = "none";
        }

        const existingViewer = document.getElementById("registrationViewerPage");
        if (existingViewer) {
            existingViewer.remove();
        }

        const viewer = document.createElement("div");
        viewer.id = "registrationViewerPage";
        viewer.innerHTML = `
            <div class="registration-section" style="padding: 40px 0 80px; background: #f5f9fc; min-height: 100vh;">
                <div class="container">
                    <div class="registration-form-container" style="max-width: 980px; margin: 0 auto;">
                        <div class="registration-form-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <div>
                                <h2>Apex Peak Swimming Registration Form</h2>
                                <p>Submitted registration details for ${entry.full_name || "Participant"}.</p>
                            </div>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-outline-secondary" id="closeRegistrationViewerButton">
                                    <i class="bi bi-arrow-left me-2"></i>
                                    Back to Dashboard
                                </button>
                                <button type="button" class="btn btn-primary" id="printRegistrationViewerButton">
                                    <i class="bi bi-printer me-2"></i>
                                    Print
                                </button>
                            </div>
                        </div>

                        <form id="viewRegistrationForm" novalidate>
                            <div class="registration-section-title"><span>01</span><div><h3>Swimmer/Participant Information</h3><p>Information about the person being registered.</p></div></div>
                            <div class="registration-form-group">
                                <label>Which participant/swimmer is being registered for this program?</label>
                                <div class="registration-options">
                                    <label class="registration-option"><input type="radio" name="participant_type" value="Adult"> <span>An Adult</span></label>
                                    <label class="registration-option"><input type="radio" name="participant_type" value="Child"> <span>A Child</span></label>
                                </div>
                            </div>
                            <div class="registration-form-group"><label for="full_name">Swimmer Full Name (First and Last)</label><input type="text" id="full_name" name="full_name" class="form-control registration-input"></div>
                            <div class="row">
                                <div class="col-md-6"><div class="registration-form-group"><label for="date_of_birth">Date of Birth</label><input type="date" id="date_of_birth" name="date_of_birth" class="form-control registration-input"></div></div>
                                <div class="col-md-6"><div class="registration-form-group"><label for="age">Age</label><input type="number" id="age" name="age" class="form-control registration-input" min="0" max="120"></div></div>
                            </div>
                            <div class="registration-form-group">
                                <label>Gender</label>
                                <div class="registration-options">
                                    <label class="registration-option"><input type="radio" name="gender" value="Male"> <span>Male</span></label>
                                    <label class="registration-option"><input type="radio" name="gender" value="Female"> <span>Female</span></label>
                                    <label class="registration-option"><input type="radio" name="gender" value="Prefer not to say"> <span>Prefer not to say</span></label>
                                </div>
                            </div>
                            <div class="registration-form-group"><label for="home_address">Home Address</label><textarea id="home_address" name="home_address" class="form-control registration-textarea" rows="3"></textarea></div>
                            <div class="registration-form-group"><label for="school">School</label><input type="text" id="school" name="school" class="form-control registration-input"></div>

                            <div class="registration-section-title"><span>02</span><div><h3>Parent / Guardian Information</h3><p>Contact information for the parent or guardian.</p></div></div>
                            <div class="registration-form-group"><label for="parent_name">Parent/Guardian Name</label><input type="text" id="parent_name" name="parent_name" class="form-control registration-input"></div>
                            <div class="registration-form-group"><label for="relationship">Relationship to Participant</label><input type="text" id="relationship" name="relationship" class="form-control registration-input"></div>
                            <div class="row">
                                <div class="col-md-6"><div class="registration-form-group"><label for="phone">Telephone Number</label><input type="tel" id="phone" name="phone" class="form-control registration-input"></div></div>
                                <div class="col-md-6"><div class="registration-form-group"><label for="email">Email Address</label><input type="email" id="email" name="email" class="form-control registration-input"></div></div>
                            </div>
                            <div class="registration-form-group">
                                <label>Which day(s) are you available for swim?</label>
                                <div class="registration-checkbox-grid">
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Mon"> <span>Monday</span></label>
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Tues"> <span>Tuesday</span></label>
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Wed"> <span>Wednesday</span></label>
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Thur"> <span>Thursday</span></label>
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Fri"> <span>Friday</span></label>
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Sat"> <span>Saturday</span></label>
                                    <label class="registration-option"><input type="checkbox" name="available_days" value="Sun"> <span>Sunday</span></label>
                                </div>
                            </div>

                            <div class="registration-section-title"><span>03</span><div><h3>Emergency Contact Information</h3><p>Primary emergency contact information.</p></div></div>
                            <div class="registration-form-group"><label for="emergency_name">Name (First and Last)</label><input type="text" id="emergency_name" name="emergency_name" class="form-control registration-input"></div>
                            <div class="registration-form-group"><label for="emergency_relationship">Relationship to Participant</label><input type="text" id="emergency_relationship" name="emergency_relationship" class="form-control registration-input"></div>
                            <div class="registration-form-group"><label for="emergency_phone">Telephone Number</label><input type="tel" id="emergency_phone" name="emergency_phone" class="form-control registration-input"></div>

                            <div class="registration-section-title"><span>04</span><div><h3>Swimmer Experience</h3><p>Tell us about the swimmer's current swimming ability.</p></div></div>
                            <div class="registration-form-group">
                                <label>Swimmer Experience</label>
                                <div class="registration-options">
                                    <label class="registration-option"><input type="checkbox" name="experience" value="Beginner"> <span>Beginner</span></label>
                                    <label class="registration-option"><input type="checkbox" name="experience" value="Intermediate"> <span>Intermediate</span></label>
                                    <label class="registration-option"><input type="checkbox" name="experience" value="Advance"> <span>Advanced</span></label>
                                    <label class="registration-option"><input type="checkbox" name="experience" value="Can Float Independently"> <span>Can Float Independently</span></label>
                                    <div class="registration-other-option"><label class="registration-option"><input type="checkbox" name="experience_other_check" value="Other"> <span>Other:</span></label><input type="text" name="experience_other" class="form-control registration-input" placeholder="Please specify"></div>
                                </div>
                            </div>

                            <div class="registration-section-title"><span>05</span><div><h3>Medical Information</h3><p>Please check any conditions that apply.</p></div></div>
                            <div class="registration-form-group">
                                <label>Medical Information</label>
                                <div class="registration-options">
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Asthma"> <span>Asthma</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Allergies"> <span>Allergies</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Seizure Disorder/Epilepsy"> <span>Seizure Disorder/Epilepsy</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Ear Infection"> <span>Ear Infection</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Autism Spectrum Disorder (ASD)"> <span>Autism Spectrum Disorder (ASD)</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="ADD/ADHD"> <span>ADD/ADHD</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Chronic Illness"> <span>Chronic Illness</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Prescription Medication"> <span>Prescription Medication</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="EpiPen Required"> <span>EpiPen Required</span></label>
                                    <label class="registration-option"><input type="checkbox" name="medical_conditions" value="Special Needs"> <span>Special Needs</span></label>
                                    <div class="registration-other-option"><label class="registration-option"><input type="checkbox" name="medical_other_check" value="Other"> <span>Other:</span></label><input type="text" name="medical_other" class="form-control registration-input" placeholder="Please specify"></div>
                                </div>
                            </div>
                            <div class="registration-form-group"><label for="medical_details">Please provide details for any chosen above (if any)</label><textarea id="medical_details" name="medical_details" class="form-control registration-textarea" rows="4"></textarea></div>
                            <div class="registration-form-group"><label for="current_medications">Current Medications</label><input type="text" id="current_medications" name="current_medications" class="form-control registration-input"></div>
                            <div class="registration-form-group"><label for="physician">Primary Physician</label><input type="text" id="physician" name="physician" class="form-control registration-input"></div>
                            <div class="registration-form-group"><label for="physician_phone">Physician Contact Number</label><input type="tel" id="physician_phone" name="physician_phone" class="form-control registration-input"></div>

                            <div class="registration-section-title"><span>06</span><div><h3>Consents & Declarations</h3><p>Please review each declaration carefully.</p></div></div>
                            <div class="registration-form-group"><label>Health Declaration</label><p class="registration-help">I confirm that the participant:</p><div class="registration-options"><label class="registration-option"><input type="radio" name="health_declaration" value="Is physically fit to participate"> <span>Is physically fit to participate</span></label><label class="registration-option"><input type="radio" name="health_declaration" value="Has no contagious illness"> <span>Has no contagious illness</span></label><label class="registration-option"><input type="radio" name="health_declaration" value="Has not been advised by a physician to avoid swimming activities"> <span>Has not been advised by a physician to avoid swimming activities</span></label><label class="registration-option"><input type="radio" name="health_declaration" value="Option 4"> <span>Option 4</span></label></div></div>
                            <div class="registration-form-group"><label for="health_declaration_doc">Health Declaration (Upload)</label><input type="text" id="health_declaration_doc" name="health_declaration_doc" class="form-control registration-input"></div>
                            <div class="registration-form-group"><label>Photo and Media Consent</label><p class="registration-help">I grant permission for photographs and/or videos to be used for:</p><div class="registration-options"><label class="registration-option"><input type="radio" name="photo_consent" value="Website"> <span>Website</span></label><label class="registration-option"><input type="radio" name="photo_consent" value="Social Media"> <span>Social Media</span></label><label class="registration-option"><input type="radio" name="photo_consent" value="Promotional Material"> <span>Promotional Material</span></label><label class="registration-option"><input type="radio" name="photo_consent" value="I Do Not Consent"> <span>I Do Not Consent</span></label></div></div>
                            <div class="registration-form-group"><label for="emergency_medical_consent">Emergency Medical Consent</label><p class="registration-help">In the event of an emergency, I authorize Apex Peak Swimming Program to obtain necessary medical treatment for the participant if I cannot be contacted.</p><input type="text" id="emergency_medical_consent" name="emergency_medical_consent" class="form-control registration-input" placeholder="Signature"></div>
                            <div class="registration-form-group"><label for="acknowledgement_risk">Acknowledgement of Risk</label><p class="registration-help">I understand that swimming activities involve inherent risks.</p><input type="text" id="acknowledgement_risk" name="acknowledgement_risk" class="form-control registration-input" placeholder="Signature & Initials"></div>
                            <div class="registration-form-group"><label for="liability_waiver">Liability Waiver</label><p class="registration-help">I release Apex Peak Swimming Program, its instructors, employees, and representatives from liability for injuries or damages arising from participation.</p><input type="text" id="liability_waiver" name="liability_waiver" class="form-control registration-input" placeholder="Signature"></div>
                            <div class="registration-form-group"><label>Program Policies</label><div class="registration-options"><label class="registration-option"><input type="checkbox" name="program_policies" value="Missed Lessons are non-refundable"> <span>Missed lessons are non-refundable</span></label><label class="registration-option"><input type="checkbox" name="program_policies" value="Participants must follow all pool rules"> <span>Participants must follow all pool rules</span></label><label class="registration-option"><input type="checkbox" name="program_policies" value="Disruptive or unsafe behavior may result in removal from the program"> <span>Disruptive or unsafe behavior may result in removal from the program</span></label><label class="registration-option"><input type="checkbox" name="program_policies" value="Lessons may be rescheduled due to weather or pool closures"> <span>Lessons may be rescheduled due to weather or pool closures</span></label></div></div>
                            <div class="registration-form-group"><label for="declaration_agree">Parent / Guardian Declaration</label><p class="registration-help">I certify that the information provided is accurate and complete.</p><input type="text" id="declaration_agree" name="declaration_agree" class="form-control registration-input" placeholder="Your Answer"></div>
                            <div class="registration-form-group"><label for="parent_signature">Parent / Guardian Signature</label><input type="text" id="parent_signature" name="parent_signature" class="form-control registration-input" placeholder="Signature"></div>
                            <div class="registration-form-group"><label for="today_date">Today's Date</label><input type="date" id="today_date" name="today_date" class="form-control registration-input"></div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(viewer);

        const form = document.getElementById("viewRegistrationForm");
        if (form) {
            populateReadOnlyRegistrationForm(form, entry);
        }

        const closeButton = document.getElementById("closeRegistrationViewerButton");
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                const dashboard = document.querySelector(".admin-dashboard-page");
                if (dashboard) {
                    dashboard.style.display = "block";
                }

                const topNav = document.getElementById("navbar-container");
                const siteFooter = document.getElementById("footer-container");

                if (topNav) {
                    topNav.style.display = "block";
                }

                if (siteFooter) {
                    siteFooter.style.display = "block";
                }

                viewer.remove();
            });
        }

        const printButton = document.getElementById("printRegistrationViewerButton");
        if (printButton) {
            printButton.addEventListener("click", () => {
                window.print();
            });
        }
    }

    document.querySelectorAll(".detail-link").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);
            const entry = registrations.find((item) => Number(item.id) === id);

            if (!entry) {
                return;
            }

            showRegistrationViewer(entry);
        });
    });
}

async function loadAdminDashboard() {
    const hasLocalSession = localStorage.getItem("apexPeakAdminSession") === "true";

    try {
        const sessionResponse = await fetch("http://localhost:5000/api/admin/session", {
            credentials: "include"
        });

        const sessionData = await sessionResponse.json().catch(() => ({}));

        if (!sessionResponse.ok || !sessionData.authenticated) {
            if (!hasLocalSession) {
                window.location.href = "Admin-Login.html";
                return;
            }
        }
    } catch (error) {
        console.error(error);
        if (!hasLocalSession) {
            window.location.href = "Admin-Login.html";
            return;
        }
    }

    const refreshButton = document.getElementById("refreshRegistrationsButton");
    const logoutButton = document.getElementById("adminLogoutButton");
    const searchInput = document.getElementById("registrationSearchInput");
    const statusFilter = document.getElementById("registrationStatusFilter");
    const clearFiltersButton = document.getElementById("clearFiltersButton");

    const loadDashboardData = async () => {
        try {
            const registrations = await fetchRegistrations();
            renderAdminDashboard(registrations);
        } catch (error) {
            console.error(error);
            const tableBody = document.getElementById("adminRegistrationTableBody");
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger py-4">
                            Unable to load registrations right now.
                        </td>
                    </tr>
                `;
            }
        }
    };

    if (refreshButton) {
        refreshButton.addEventListener("click", loadDashboardData);
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await fetch("http://localhost:5000/api/admin/logout", {
                    method: "POST",
                    credentials: "include"
                });
            } catch (error) {
                console.error(error);
            }

            localStorage.removeItem("apexPeakAdminSession");
            localStorage.removeItem("apexPeakAdminEmail");
            window.location.href = "Admin-Login.html";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", async () => {
            const registrations = await fetchRegistrations();
            renderAdminDashboard(registrations);
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", async () => {
            const registrations = await fetchRegistrations();
            renderAdminDashboard(registrations);
        });
    }

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", async () => {
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "all";
            const registrations = await fetchRegistrations();
            renderAdminDashboard(registrations);
        });
    }

    const printBlankFormButton = document.getElementById("printRegistrationBlankButton");
    if (printBlankFormButton) {
        printBlankFormButton.addEventListener("click", () => {
            window.print();
        });
    }

    loadDashboardData();
}

/* ==========================================
   INITIALIZE WEBSITE
========================================== */

async function initializeWebsite() {
    await loadNavbar();
    await loadFooter();

    setCurrentYear();
    setupBackToTop();
    setupNavbarScroll();
    setupMobileNavbar();

    if (document.getElementById("adminRegistrationTableBody")) {
        loadAdminDashboard();
    }
}


/* ==========================================
   START WEBSITE
========================================== */

document.addEventListener("DOMContentLoaded", initializeWebsite);

console.log("Main.js loaded successfully");

const registrationForm = document.getElementById("registrationForm");

if (registrationForm) {
    registrationForm.noValidate = true;
    registrationForm.addEventListener("submit", submitRegistrationForm);
}