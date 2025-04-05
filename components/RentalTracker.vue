<template>
    <div class="container mt-4">
      <h1 class="mb-4 text-center">Учет аренды комнат</h1>
  
      <!-- Фильтр по типу оплаты -->
      <div class="mb-4">
        <select v-model="filter.paymentType" class="form-select" aria-label="Фильтр по типу оплаты">
          <option value="">Все</option>
          <option value="День">День</option>
          <option value="Неделя">Неделя</option>
          <option value="Месяц">Месяц</option>
        </select>
      </div>
  
      <div class="table-responsive">
        <!-- Первая таблица -->
        <table class="table table-bordered table-hover">
          <thead class="thead-dark">
            <tr>
              <th>Комната</th>
              <th>Фамилия</th>
              <th>Тип оплаты</th>
              <th>Заезд</th>
              <th>До</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(room, index) in filteredRooms" :key="index">
              <td class="font-weight-bold">{{ room.name }}</td>
              <td>
                <input type="text" class="form-control" v-model="room.tenant" placeholder="Введите фамилию арендатора" @input="saveToLocalStorage" />
              </td>
              <td>
                <select class="form-select" v-model="room.paymentType" @change="calculateDueDate(index)">
                  <option value="День">День</option>
                  <option value="Неделя">Неделя</option>
                  <option value="Месяц">Месяц</option>
                </select>
              </td>
              <td>
                <input type="date" class="form-control" v-model="room.startDate" @change="calculateDueDate(index)" />
              </td>
              <td :class="{'text-danger': isOverdue(room.dueDate), 'bg-warning': isNearDueDate(room.dueDate)}">
                {{ formatDate(room.dueDate) }}
                <span v-if="isNearDueDate(room.dueDate)" style="color: black;">Скоро истекает!</span>

              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Вторая таблица для отображения стоимости -->
      <div v-if="rooms.some(room => room.tenant)">
        <h2 class="text-center mt-4">Стоимость аренды</h2>
        <table class="table table-bordered table-hover">
          <thead class="thead-dark">
            <tr>
              <th>Комната</th>
              <th>Стоимость</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(room, index) in filteredRooms" :key="index">
              <td>{{ room.name }}</td>
              <td v-if="room.tenant">{{ calculatePrice(room) }} $</td>
              <td v-else>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watchEffect } from 'vue';
  
  const rooms = ref([
    { name: "АГАТ", paymentType: "День", startDate: "2025-04-01", dueDate: "", tenant: "", pricePerDay: 50, pricePerWeek: 220, pricePerMonth: 750 },
    { name: "№ 1 КАЛЬЦИТ", paymentType: "Неделя", startDate: "2025-04-02", dueDate: "", tenant: "", pricePerDay: 55, pricePerWeek: 300, pricePerMonth: 950 },
    { name: "№ 4 ТУРМАЛИН", paymentType: "Месяц", startDate: "2025-04-03", dueDate: "", tenant: "", pricePerDay: 55, pricePerWeek: 300, pricePerMonth: 950 },
    { name: "ЯНТАРЬ", paymentType: "День", startDate: "2025-04-04", dueDate: "", tenant: "", pricePerDay: 60, pricePerWeek: 350, pricePerMonth: 1100 },
    { name: "№ 2 ЭМЕРАЛЬД", paymentType: "Неделя", startDate: "2025-04-05", dueDate: "", tenant: "", pricePerDay: 60, pricePerWeek: 350, pricePerMonth: 1100 },
    { name: "АМЕТИСТ", paymentType: "Месяц", startDate: "2025-04-06", dueDate: "", tenant: "", pricePerDay: 60, pricePerWeek: 350, pricePerMonth: 1100 }
  ]);
  
  const filter = ref({
    paymentType: "",
  });
  
  const filteredRooms = computed(() => {
    return rooms.value.filter((room) => {
      return filter.value.paymentType ? room.paymentType === filter.value.paymentType : true;
    });
  });
  
  const loadFromLocalStorage = () => {
    if (process.client) {
      const savedRooms = localStorage.getItem('rooms');
      if (savedRooms) {
        rooms.value = JSON.parse(savedRooms);
      }
    }
  };
  
  const saveToLocalStorage = () => {
    if (process.client) {
      localStorage.setItem('rooms', JSON.stringify(rooms.value));
    }
  };
  
  loadFromLocalStorage();
  
  const calculateDueDate = (index) => {
    const room = rooms.value[index];
    const startDate = new Date(room.startDate);
    let dueDate = new Date(startDate);
  
    if (room.paymentType === "День") {
      dueDate.setDate(dueDate.getDate() + 1);
    } else if (room.paymentType === "Неделя") {
      dueDate.setDate(dueDate.getDate() + 7);
    } else if (room.paymentType === "Месяц") {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }
  
    room.dueDate = dueDate.toISOString().split('T')[0];
  };
  
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };
  
  const isNearDueDate = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= 3 && diffDays >= 0; // Пример: уведомление за 3 дня до окончания аренды
  };
  
  const formatDate = (dueDate) => {
    if (!dueDate) return '';
  
    const date = new Date(dueDate);
    const day = date.getDate();
    const month = date.toLocaleString('ru', { month: 'long' });
  
    return `${day} ${month}`;
  };
  
  const calculatePrice = (room) => {
    if (room.paymentType === "День") {
      return room.pricePerDay;
    } else if (room.paymentType === "Неделя") {
      return room.pricePerWeek;
    } else if (room.paymentType === "Месяц") {
      return room.pricePerMonth;
    }
    return 0;
  };
  
  watchEffect(() => {
    saveToLocalStorage();
  });
  </script>
  
  <style scoped>
  /* Основной контейнер */

  /* Основной контейнер */
.container {
  max-width: 80%;  /* Для десктопов — 80% от ширины */
  margin-left: auto;
  margin-right: auto;
  padding-left: 15px;
  padding-right: 15px;
}



  
  /* Таблица */
  .table-responsive {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    font-size: 1rem;
  }
  
  thead th {
    text-align: center;
    background-color: #343a40;
    color: white;
  }
  
  td, th {
    text-align: center;
    vertical-align: middle;
  }
  
  input.form-control, select.form-select {
    width: 100%;
  }
  
  /* Жирный шрифт для названия комнаты */
  th, td {
    font-weight: bold;
  }
  
  /* Мобильная адаптация */
  @media (max-width: 767px) {
    h1 {
      font-size: 1.5rem;
    }
  
    .form-control, .form-select {
      font-size: 1rem;
      padding: 0.5rem;
    }
  
    table {
      font-size: 0.9rem;
    }
  
    td, th {
      padding: 0.5rem;
    }
  
    .table-responsive {
      -webkit-overflow-scrolling: touch;
    }
    .container {
    max-width: 100%;  /* Для мобильных устройств — 100% от ширины */
  }
  }
  </style>
  