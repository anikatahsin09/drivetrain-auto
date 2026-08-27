// =====================================================
// FIREBASE IMPORT
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyAn171YPpMdfdhwSxdr35uKWuRlFWx8Lek",

    authDomain: "drivetrain-auto.firebaseapp.com",

    projectId: "drivetrain-auto",

    storageBucket: "drivetrain-auto.firebasestorage.app",

    messagingSenderId: "1039615214550",

    appId: "1:1039615214550:web:e687b54027139f4e7a1a77"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// =====================================================
// CLOUDINARY
// =====================================================

const CLOUDINARY_CLOUD_NAME =
    "aqrpf6hw";

const CLOUDINARY_UPLOAD_PRESET =
    "drivetrain_cars";


// =====================================================
// CLOUDINARY IMAGE UPLOAD
// =====================================================

async function uploadCarImage(file) {

    if (!file) {

        throw new Error(
            "Please select a car image."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const response =
        await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Cloudinary Error:",
            data
        );

        throw new Error(
            data.error?.message ||
            "Image upload failed."
        );

    }


    return data.secure_url;

}


// =====================================================
// OWNER LOGIN
// =====================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                message.textContent =
                    "Login successful!";


                message.style.color =
                    "green";


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    800
                );


            } catch (error) {

                console.error(
                    error
                );


                message.textContent =
                    "Invalid email or password.";


                message.style.color =
                    "red";

            }

        }
    );

}


// =====================================================
// LOGOUT
// =====================================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            try {

                await signOut(
                    auth
                );


                window.location.href =
                    "admin.html";


            } catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


// =====================================================
// OWNER DASHBOARD PROTECTION
// =====================================================

onAuthStateChanged(
    auth,
    function (user) {

        const page =
            window.location.pathname;


        if (
            page.includes(
                "dashboard.html"
            ) &&
            !user
        ) {

            window.location.href =
                "admin.html";

        }

    }
);


// =====================================================
// ADD CAR
// =====================================================

const carForm =
    document.getElementById(
        "carForm"
    );


const dashboardCarContainer =
    document.getElementById(
        "dashboardCarContainer"
    );


if (carForm) {

    carForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("carName")
                    .value
                    .trim();


            const model =
                document
                    .getElementById("carModel")
                    .value
                    .trim();


            const price =
                document
                    .getElementById("carPrice")
                    .value
                    .trim();


            const mileage =
                document
                    .getElementById("carMileage")
                    .value
                    .trim();


            const imageInput =
                document.getElementById(
                    "carImage"
                );


            const status =
                document
                    .getElementById("carStatus")
                    .value;


            const description =
                document
                    .getElementById("carDescription")
                    .value
                    .trim();


            const file =
                imageInput.files[0];


            if (!file) {

                alert(
                    "Please select a car image."
                );

                return;

            }


            try {

                const submitButton =
                    carForm.querySelector(
                        "button[type='submit']"
                    );


                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "Uploading Image...";


                // Upload image to Cloudinary

                const imageUrl =
                    await uploadCarImage(
                        file
                    );


                submitButton.textContent =
                    "Saving Car...";


                // Save car to Firebase

                await addDoc(
                    collection(
                        db,
                        "cars"
                    ),
                    {

                        name: name,

                        model: model,

                        price: price,

                        mileage: mileage,

                        image: imageUrl,

                        status: status,

                        description: description,

                        createdAt:
                            serverTimestamp()

                    }
                );


                alert(
                    "Car added successfully! 🚗"
                );


                carForm.reset();


                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "Add Car";


                if (
                    dashboardCarContainer
                ) {

                    loadDashboardCars();

                }


                // Also refresh customer cars

                if (
                    carContainer
                ) {

                    loadCustomerCars();

                }


            } catch (error) {

                console.error(
                    "Add Car Error:",
                    error
                );


                alert(
                    "Failed to add car: " +
                    error.message
                );


                const submitButton =
                    carForm.querySelector(
                        "button[type='submit']"
                    );


                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "Add Car";

            }

        }
    );

}


// =====================================================
// CUSTOMER CAR SECTION
// =====================================================

const carContainer =
    document.getElementById(
        "carContainer"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


let allCars = [];


if (carContainer) {

    loadCustomerCars();

}


// =====================================================
// LOAD CUSTOMER CARS
// =====================================================

async function loadCustomerCars() {

    if (!carContainer) {

        return;

    }


    try {

        carContainer.innerHTML = `
            <p>Loading cars...</p>
        `;


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "cars"
                )
            );


        allCars = [];


        snapshot.forEach(
            function (carDoc) {

                allCars.push({

                    id:
                        carDoc.id,

                    ...carDoc.data()

                });

            }
        );


        displayCustomerCars(
            allCars
        );


    } catch (error) {

        console.error(
            "Load Cars Error:",
            error
        );


        carContainer.innerHTML = `
            <p>
                Unable to load cars.
            </p>
        `;

    }

}


// =====================================================
// DISPLAY CUSTOMER CARS
// =====================================================

function displayCustomerCars(
    cars
) {

    if (!carContainer) {

        return;

    }


    carContainer.innerHTML =
        "";


    if (cars.length === 0) {

        carContainer.innerHTML = `
            <p>
                No cars available.
            </p>
        `;

        return;

    }


    cars.forEach(
        function (car) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "car-card";


            let statusClass =
                "available";


            if (
                car.status ===
                "Sold Out"
            ) {

                statusClass =
                    "sold";

            }


            if (
                car.status ===
                "Pre-Order"
            ) {

                statusClass =
                    "preorder";

            }


            let actionButton = "";


            // SOLD OUT

            if (
                car.status ===
                "Sold Out"
            ) {

                actionButton = `

                    <button
                        class="buy-button sold-button"
                        disabled
                    >
                        Sold Out
                    </button>

                `;

            }


            // PRE-ORDER

            else if (
                car.status ===
                "Pre-Order"
            ) {

                actionButton = `

                    <button
                        class="buy-button preorder-button"
                    >
                        Pre-Order Now
                    </button>

                `;

            }


            // AVAILABLE

            else {

                actionButton = `

                    <button
                        class="buy-button"
                    >
                        Buy / Contact
                    </button>

                `;

            }


            card.innerHTML = `

                <img
                    src="${
                        car.image ||
                        "drivetrainlogo.jpeg"
                    }"
                    alt="${
                        car.name ||
                        "Car"
                    }"
                    onerror="
                        this.src='drivetrainlogo.jpeg'
                    "
                >


                <div class="car-info">

                    <h3>
                        ${
                            car.name ||
                            "Car"
                        }
                    </h3>


                    <p>
                        <strong>Model:</strong>
                        ${
                            car.model ||
                            "N/A"
                        }
                    </p>


                    <p>
                        <strong>Mileage:</strong>
                        ${
                            car.mileage ||
                            "N/A"
                        }
                    </p>


                    <p class="price">
                        ৳${
                            car.price ||
                            "N/A"
                        }
                    </p>


                    <p class="${statusClass}">
                        ● ${
                            car.status ||
                            "Available"
                        }
                    </p>


                    <p>
                        ${
                            car.description ||
                            ""
                        }
                    </p>


                    ${actionButton}

                </div>

            `;


            const button =
                card.querySelector(
                    ".buy-button"
                );


            // Don't add click for Sold Out

            if (
                button &&
                car.status !==
                "Sold Out"
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        openOrderForm(
                            car
                        );

                    }
                );

            }


            carContainer.appendChild(
                card
            );

        }
    );

}


// =====================================================
// CUSTOMER SEARCH
// =====================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const text =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                allCars.filter(
                    function (car) {

                        const name =
                            (
                                car.name ||
                                ""
                            )
                                .toLowerCase();


                        const model =
                            (
                                car.model ||
                                ""
                            )
                                .toLowerCase();


                        return (

                            name.includes(
                                text
                            )

                            ||

                            model.includes(
                                text
                            )

                        );

                    }
                );


            displayCustomerCars(
                filtered
            );

        }
    );

}


// =====================================================
// CUSTOMER ORDER FORM
// =====================================================

const orderSection =
    document.getElementById(
        "orderSection"
    );


const orderForm =
    document.getElementById(
        "orderForm"
    );


const selectedCar =
    document.getElementById(
        "selectedCar"
    );


const cancelOrderBtn =
    document.getElementById(
        "cancelOrderBtn"
    );


const orderMessage =
    document.getElementById(
        "orderMessage"
    );


let selectedCarData =
    null;


// =====================================================
// OPEN ORDER FORM
// =====================================================

function openOrderForm(
    car
) {

    selectedCarData =
        car;


    if (!orderSection) {

        return;

    }


    if (selectedCar) {

        selectedCar.innerHTML = `

            <strong>
                Selected Car:
            </strong>

            ${
                car.name ||
                "Car"
            }

            ${
                car.model
                    ? `(${car.model})`
                    : ""
            }

            <br>

            <strong>
                Price:
            </strong>

            ৳${
                car.price ||
                "N/A"
            }

        `;

    }


    if (orderSection) {

        orderSection.style.display =
            "block";


        orderSection.scrollIntoView({
            behavior: "smooth"
        });

    }


    if (orderMessage) {

        orderMessage.textContent =
            "";

    }

}


// =====================================================
// CANCEL ORDER
// =====================================================

if (cancelOrderBtn) {

    cancelOrderBtn.addEventListener(
        "click",
        function () {

            orderSection.style.display =
                "none";


            if (orderForm) {

                orderForm.reset();

            }


            selectedCarData =
                null;

        }
    );

}


// =====================================================
// SUBMIT CUSTOMER ORDER
// =====================================================

if (orderForm) {

    orderForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!selectedCarData) {

                alert(
                    "Please select a car first."
                );

                return;

            }


            const customerName =
                document
                    .getElementById(
                        "customerName"
                    )
                    .value
                    .trim();


            const phone =
                document
                    .getElementById(
                        "customerPhone"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "customerEmail"
                    )
                    .value
                    .trim();


            const orderType =
                document
                    .getElementById(
                        "orderType"
                    )
                    .value;


            const message =
                document
                    .getElementById(
                        "customerMessage"
                    )
                    .value
                    .trim();


            const submitButton =
                orderForm.querySelector(
                    "button[type='submit']"
                );


            try {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "Submitting...";


                // Save order to Firebase

                await addDoc(
                    collection(
                        db,
                        "orders"
                    ),
                    {

                        customerName:
                            customerName,

                        phone:
                            phone,

                        email:
                            email,

                        carId:
                            selectedCarData.id,

                        carName:
                            selectedCarData.name,

                        carModel:
                            selectedCarData.model,

                        carPrice:
                            selectedCarData.price,

                        orderType:
                            orderType,

                        message:
                            message,

                        orderStatus:
                            "Pending",

                        createdAt:
                            serverTimestamp()

                    }
                );


                if (orderMessage) {

                    orderMessage.textContent =
                        "Order submitted successfully! We will contact you soon. ✅";

                    orderMessage.style.color =
                        "green";

                }


                alert(
                    "Your order has been submitted successfully! 🚗✅"
                );


                orderForm.reset();


                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "Submit Order";


                setTimeout(
                    function () {

                        orderSection.style.display =
                            "none";

                        selectedCarData =
                            null;

                    },
                    2500
                );


            } catch (error) {

                console.error(
                    "Order Error:",
                    error
                );


                alert(
                    "Failed to submit order: " +
                    error.message
                );


                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "Submit Order";

            }

        }
    );

}


// =====================================================
// DASHBOARD
// =====================================================

if (
    dashboardCarContainer
) {

    loadDashboardCars();

}


// =====================================================
// LOAD DASHBOARD CARS
// =====================================================

async function loadDashboardCars() {

    if (
        !dashboardCarContainer
    ) {

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "cars"
                )
            );


        dashboardCarContainer.innerHTML =
            "";


        if (snapshot.empty) {

            dashboardCarContainer.innerHTML = `
                <p>
                    No cars found.
                </p>
            `;

            return;

        }


        snapshot.forEach(
            function (carDoc) {

                const car =
                    carDoc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "car-card";


                card.innerHTML = `

                    ${
                        car.image
                            ? `

                                <img
                                    src="${car.image}"
                                    alt="${
                                        car.name ||
                                        "Car"
                                    }"
                                    onerror="
                                        this.src='drivetrainlogo.jpeg'
                                    "
                                >

                            `
                            : ""
                    }


                    <div class="car-info">

                        <h3>
                            ${
                                car.name ||
                                "Car"
                            }
                        </h3>


                        <p>
                            <strong>Model:</strong>
                            ${
                                car.model ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Price:</strong>
                            ৳${
                                car.price ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Mileage:</strong>
                            ${
                                car.mileage ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Status:</strong>
                            ${
                                car.status ||
                                "Available"
                            }
                        </p>


                        <p>
                            ${
                                car.description ||
                                ""
                            }
                        </p>


                        <div>

                            <button
                                class="edit-btn"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                class="delete-btn"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;


                // EDIT

                card.querySelector(
                    ".edit-btn"
                ).addEventListener(
                    "click",
                    function () {

                        editCar(
                            carDoc.id,
                            car
                        );

                    }
                );


                // DELETE

                card.querySelector(
                    ".delete-btn"
                ).addEventListener(
                    "click",
                    function () {

                        deleteCar(
                            carDoc.id
                        );

                    }
                );


                dashboardCarContainer.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        dashboardCarContainer.innerHTML = `
            <p>
                Unable to load cars.
            </p>
        `;

    }

}


// =====================================================
// EDIT CAR
// =====================================================

async function editCar(
    carId,
    oldCar
) {

    const name =
        prompt(
            "Car Name:",
            oldCar.name || ""
        );


    if (name === null) {

        return;

    }


    const model =
        prompt(
            "Model:",
            oldCar.model || ""
        );


    if (model === null) {

        return;

    }


    const price =
        prompt(
            "Price:",
            oldCar.price || ""
        );


    if (price === null) {

        return;

    }


    const mileage =
        prompt(
            "Mileage:",
            oldCar.mileage || ""
        );


    if (mileage === null) {

        return;

    }


    const status =
        prompt(
            "Status: Available / Sold Out / Pre-Order",
            oldCar.status || "Available"
        );


    if (status === null) {

        return;

    }


    const description =
        prompt(
            "Description:",
            oldCar.description || ""
        );


    if (description === null) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "cars",
                carId
            ),

            {

                name:
                    name.trim(),

                model:
                    model.trim(),

                price:
                    price.trim(),

                mileage:
                    mileage.trim(),

                status:
                    status.trim(),

                description:
                    description.trim()

            }

        );


        alert(
            "Car updated successfully! ✅"
        );


        loadDashboardCars();


        if (carContainer) {

            loadCustomerCars();

        }


    } catch (error) {

        console.error(
            "Update Error:",
            error
        );


        alert(
            "Failed to update car."
        );

    }

}


// =====================================================
// DELETE CAR
// =====================================================

async function deleteCar(
    carId
) {

    const answer =
        confirm(
            "Are you sure you want to delete this car?"
        );


    if (!answer) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "cars",
                carId
            )

        );


        alert(
            "Car deleted successfully! 🗑️"
        );


        loadDashboardCars();


        if (carContainer) {

            loadCustomerCars();

        }


    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );


        alert(
            "Failed to delete car."
        );

    }

}


// =====================================================
// OWNER ORDERS
// =====================================================

const viewOrdersBtn =
    document.getElementById(
        "viewOrdersBtn"
    );


const ordersSection =
    document.getElementById(
        "ordersSection"
    );


const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );


// =====================================================
// VIEW ORDERS BUTTON
// =====================================================

if (viewOrdersBtn) {

    viewOrdersBtn.addEventListener(
        "click",
        function () {

            if (ordersSection) {

                ordersSection.style.display =
                    "block";


                ordersSection.scrollIntoView({
                    behavior: "smooth"
                });

            }


            loadOrders();

        }
    );

}


// =====================================================
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    if (!ordersContainer) {

        return;

    }


    ordersContainer.innerHTML = `
        <p>
            Loading orders...
        </p>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        ordersContainer.innerHTML =
            "";


        if (snapshot.empty) {

            ordersContainer.innerHTML = `
                <p>
                    No customer orders yet.
                </p>
            `;

            return;

        }


        snapshot.forEach(
            function (orderDoc) {

                const order =
                    orderDoc.data();


                const orderCard =
                    document.createElement(
                        "div"
                    );


                orderCard.className =
                    "order-card";


                orderCard.innerHTML = `

                    <div class="order-info">

                        <h3>
                            🚗 ${
                                order.carName ||
                                "Car"
                            }
                        </h3>


                        <p>
                            <strong>Model:</strong>
                            ${
                                order.carModel ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Price:</strong>
                            ৳${
                                order.carPrice ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Customer:</strong>
                            ${
                                order.customerName ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Phone:</strong>
                            ${
                                order.phone ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Email:</strong>
                            ${
                                order.email ||
                                "N/A"
                            }
                        </p>


                        <p>
                            <strong>Order Type:</strong>
                            ${
                                order.orderType ||
                                "Buy"
                            }
                        </p>


                        <p>
                            <strong>Status:</strong>
                            ${
                                order.orderStatus ||
                                "Pending"
                            }
                        </p>


                        <p>
                            <strong>Message:</strong>
                            ${
                                order.message ||
                                "No message"
                            }
                        </p>


                        <div class="order-buttons">

                            <button
                                class="confirm-order-btn"
                            >
                                ✅ Confirm
                            </button>


                            <button
                                class="cancel-order-btn"
                            >
                                ❌ Cancel
                            </button>


                            <button
                                class="delete-order-btn"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;


                // CONFIRM

                orderCard
                    .querySelector(
                        ".confirm-order-btn"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            updateOrderStatus(
                                orderDoc.id,
                                "Confirmed"
                            );

                        }
                    );


                // CANCEL

                orderCard
                    .querySelector(
                        ".cancel-order-btn"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            updateOrderStatus(
                                orderDoc.id,
                                "Cancelled"
                            );

                        }
                    );


                // DELETE

                orderCard
                    .querySelector(
                        ".delete-order-btn"
                    )
                    .addEventListener(
                        "click",
                        function () {

                            deleteOrder(
                                orderDoc.id
                            );

                        }
                    );


                ordersContainer.appendChild(
                    orderCard
                );

            }
        );


    } catch (error) {

        console.error(
            "Load Orders Error:",
            error
        );


        ordersContainer.innerHTML = `
            <p>
                Unable to load orders.
            </p>
        `;

    }

}


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

async function updateOrderStatus(
    orderId,
    newStatus
) {

    try {

        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                orderStatus:
                    newStatus

            }

        );


        alert(
            "Order status updated! ✅"
        );


        loadOrders();


    } catch (error) {

        console.error(
            "Update Order Error:",
            error
        );


        alert(
            "Failed to update order."
        );

    }

}


// =====================================================
// DELETE ORDER
// =====================================================

async function deleteOrder(
    orderId
) {

    const answer =
        confirm(
            "Are you sure you want to delete this order?"
        );


    if (!answer) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "orders",
                orderId
            )

        );


        alert(
            "Order deleted successfully! 🗑️"
        );


        loadOrders();


    } catch (error) {

        console.error(
            "Delete Order Error:",
            error
        );


        alert(
            "Failed to delete order."
        );

    }

}