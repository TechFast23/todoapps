// Array untuk menyimpan daftar todo
const todos = [];

//* Custom event yang akan digunakan untuk merender ulang konten
const RENDER_EVENT = "render-todo";

//* Kunci penyimpanan di localStorage
const STORAGE_KEY = "TODO_APPS";

//* Event listener yang dieksekusi saat halaman selesai di-load
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form"); // Mengambil form dari HTML

  // Memeriksa apakah browser mendukung penyimpanan lokal (localStorage)
  if (isStorageExist()) {
    loadDataFromStorage(); // Jika mendukung, load data dari localStorage
  }

  // Event listener untuk menangani form submission
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Mencegah reload halaman setelah form disubmit
    addTodo(); // Menambahkan todo baru
  });
});

//* Fungsi untuk memeriksa apakah browser mendukung localStorage
function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage"); // Jika tidak mendukung, tampilkan alert
    return false;
  }
  return true;
}

//* Fungsi untuk menyimpan data todos ke localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos); // Mengubah array todos menjadi string JSON
    localStorage.setItem(STORAGE_KEY, parsed); // Menyimpan string JSON ke localStorage
    document.dispatchEvent(new Event(RENDER_EVENT)); // Dispatch event render-todo untuk merender ulang
  }
}

//* Fungsi untuk mengambil data dari localStorage dan memuatnya ke dalam array todos
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData); // Mengubah string JSON menjadi array

  // Jika data yang diambil tidak kosong, masukkan ke dalam array todos
  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  // Dispatch event render-todo untuk merender ulang konten
  document.dispatchEvent(new Event(RENDER_EVENT));
}

//* Fungsi untuk menambahkan todo baru
function addTodo() {
  // Mengambil nilai input dari form
  const textTodo = document.getElementById("title").value;
  const timestamp = document.getElementById("date").value;

  // Membuat ID unik untuk todo menggunakan timestamp
  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    textTodo,
    timestamp,
    false
  );
  todos.push(todoObject); // Menambahkan todo baru ke array todos

  saveData(); // Simpan data ke localStorage
  document.getElementById("form").reset(); // Reset form input setelah menambah todo
}

//* Fungsi untuk menghasilkan ID unik menggunakan timestamp
function generateId() {
  return +new Date(); // Mengubah waktu saat ini menjadi angka unik
}

//* Fungsi untuk membuat objek todo baru
function generateTodoObject(id, task, timestamp, isCompleted) {
  return { id, task, timestamp, isCompleted };
}

//* Event listener untuk merender ulang konten saat event render-todo terjadi
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById("todos");
  uncompletedTODOList.innerHTML = ""; // Kosongkan list item yang belum selesai

  const completedTODOList = document.getElementById("completed-todos");
  completedTODOList.innerHTML = ""; // Kosongkan list item yang sudah selesai

  // Memasukkan todo item ke dalam list yang sesuai (completed atau uncompleted)
  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isCompleted) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedTODOList.append(todoElement);
    }
  }
});

//*  Fungsi untuk menampilkan modal penghapusan
function showDeleteModal(todoId) {
  const modal = document.getElementById("deleteConfirmationModal");
  modal.style.display = "block";

  const deleteYes = document.getElementById("deleteYes");
  const deleteNo = document.getElementById("deleteNo");

  // Event handler untuk tombol "Ya"
  deleteYes.onclick = function () {
    removeTaskFromCompleted(todoId); // Panggil fungsi untuk menghapus task dari list
    modal.style.display = "none"; // Tutup modal setelah task dihapus
  };

  // Event handler untuk tombol "Tidak"
  deleteNo.onclick = function () {
    modal.style.display = "none"; // Tutup modal tanpa melakukan apapun
  };

  // Event handler untuk menutup modal ketika klik di luar modal
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

//* Fungsi untuk membuat elemen todo baru yang akan ditampilkan di halaman
function makeTodo(todoObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = todoObject.task; // Menampilkan task dari todo

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = todoObject.timestamp; // Menampilkan timestamp dari todo

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textTimestamp); // Menambahkan title dan timestamp ke dalam textContainer

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer); // Menambahkan textContainer ke dalam container utama
  container.setAttribute("id", `todo-${todoObject.id}`); // Menetapkan ID pada container berdasarkan ID todo

  // Jika todo sudah selesai, tambahkan tombol undo dan delete
  if (todoObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");

    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(todoObject.id); // Memanggil fungsi untuk undo task
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");

    // Tambahkan event listener untuk menampilkan modal konfirmasi penghapusan
    trashButton.addEventListener("click", function () {
      showDeleteModal(todoObject.id);
    });

    container.append(undoButton, trashButton); // Tambahkan tombol undo dan delete ke container
  } else {
    // Jika belum selesai, tambahkan tombol check untuk menandai task sebagai selesai
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button") ;

    // Tambahkan event listener untuk menampilkan modal konfirmasi
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(todoObject.id);
    });

    container.append(checkButton);
  }
  return container; // Kembalikan elemen todo yang telah dibuat
}

// Fungsi untuk menandai todo sebagai completed
function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId); // Cari todo berdasarkan ID

  if (todoTarget == null) return; // Jika tidak ditemukan, hentikan fungsi

  todoTarget.isCompleted = true; // Ubah status isCompleted menjadi true
  saveData(); // Simpan perubahan ke localStorage
}

// Fungsi untuk mencari todo berdasarkan ID
function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem; // Kembalikan todo yang sesuai dengan ID
    }
  }
  return null; // Jika tidak ada, kembalikan null
}

// Fungsi untuk menghapus todo yang sudah completed dari array todos
function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId); // Cari index dari todo berdasarkan ID

  if (todoTarget === -1) return; // Jika tidak ditemukan, hentikan fungsi

  todos.splice(todoTarget, 1); // Hapus todo dari array
  saveData(); // Simpan perubahan ke localStorage
}

// Fungsi untuk mengembalikan todo yang sudah completed ke uncompleted
function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId); // Cari todo berdasarkan ID

  if (todoTarget == null) return; // Jika tidak ditemukan, hentikan fungsi

  todoTarget.isCompleted = false; // Ubah status isCompleted menjadi false
  saveData(); // Simpan perubahan ke localStorage
}

// Fungsi untuk mencari index todo berdasarkan ID
function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index; // Kembalikan index dari todo yang sesuai
    }
  }
  return -1; // Jika tidak ditemukan, kembalikan -1
}
