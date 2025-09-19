<template>
    <main class="flex flex-col min-h-screen py-20 sm:py-16 md:py-20">
        <div class="container px-6 mx-auto">
            <!-- Image -->
            <section id="photo-header" class="max-w-3xl mx-auto text-center">
                <img :src="slides[currentIndex].image" alt="Slide Image"
                    class="object-cover w-56 h-auto mx-auto mb-6 rounded-lg shadow-2xl sm:mb-8" />
            </section>

            <!-- Splitter -->
            <div class="flex justify-center splitter">
                <div class="w-20 h-1 my-5 rounded-full bg-zinc-500"></div>
            </div>

            <!-- Title -->
            <h3 class="mb-4 text-base font-semibold text-center sm:text-xl">
                {{ slides[currentIndex].title }}
            </h3>

            <!-- Text Box -->
            <div class="max-w-xl mx-auto mb-10 sm:mb-16">
                <div class="p-5 bg-white shadow-xl rounded-xl sm:p-6 md:p-7">
                    <div class="space-y-4 text-sm text-gray-700 sm:space-y-6 sm:text-base">
                        <p v-for="(p, index) in slides[currentIndex].texts" :key="index"
                            :ref="(el) => (typedElements[index] = el)"></p>
                    </div>
                </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-center gap-4">
                <!-- Previous -->
                <button v-if="currentIndex > 0" @click="prevSlide"
                    class="inline-flex items-center justify-center w-12 text-white transition-colors duration-300 bg-gray-600 rounded-full opacity-30 aspect-square hover:bg-gray-700">
                    <i class="fas fa-chevron-left"></i>
                </button>

                <!-- Next -->
                <button v-if="currentIndex < slides.length - 1" @click="nextSlide" :class="[
                    'inline-flex items-center justify-center w-12 rounded-full aspect-square transition-colors duration-300',
                    typingFinished
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                ]">
                    <i class="fas fa-chevron-right"></i>
                </button>


            </div>
            <!-- Date Picker & Google Calendar Button -->
            <!-- <div v-if="currentIndex === slides.length - 1 && typingFinished" class="flex justify-center mt-6"> -->
            <div v-if="currentIndex === slides.length - 1" class="flex flex-col justify-center gap-2 mt-6 sm:flex-row">
                <input type="date" v-model="selectedDate" class="p-2 border rounded" />
                <input type="time" v-model="selectedTime" class="p-2 border rounded" />
                <button @click="addToGoogleCalendar" class="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
                    Add to Google Calendar
                </button>
            </div>

        </div>
    </main>
</template>

<script>
import Typed from "typed.js";
import { ref, onMounted, watch, nextTick } from "vue";
import { slides } from "../data/slidesData";
import { calendarConfig } from "../data/calendarConfig.js";

export default {
    setup() {
        const currentIndex = ref(
            parseInt(localStorage.getItem("currentIndex")) || 0
        );
        const selectedDate = ref('');
        const selectedTime = ref(calendarConfig.defaultStartHour); // default jam dari config

        const typedElements = [];
        let typedInstances = [];
        const typingFinished = ref(false);

        const runTypedSequential = async (texts, idx = 0) => {
            await nextTick();

            // Reset state
            if (idx === 0) {
                typingFinished.value = false;
                typedInstances.forEach((instance) => instance.destroy());
                typedInstances = [];
                typedElements.forEach((el) => {
                    if (el) el.innerHTML = "";
                });
            }

            if (idx < texts.length) {
                const el = typedElements[idx];
                if (el) {
                    const typed = new Typed(el, {
                        strings: [texts[idx]],
                        typeSpeed: 50,
                        backSpeed: 0,
                        loop: false,
                        showCursor: false,
                        onComplete: () => runTypedSequential(texts, idx + 1),
                    });
                    typedInstances.push(typed);
                }
            } else {
                typingFinished.value = true;
            }
        };

        onMounted(() => {
            runTypedSequential(slides[currentIndex.value].texts);
            setToday();
        });

        watch(currentIndex, (newIndex) => {
            localStorage.setItem("currentIndex", newIndex);
            runTypedSequential(slides[newIndex].texts);
        });

        const nextSlide = () => {
            if (currentIndex.value < slides.length - 1) currentIndex.value++;
        };
        const prevSlide = () => {
            if (currentIndex.value > 0) currentIndex.value--;
        };

        const setToday = () => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            selectedDate.value = `${yyyy}-${mm}-${dd}`;
        }

        const addToGoogleCalendar = () => {
            if (!selectedDate.value || !selectedTime.value) return alert("Please select date and time!");

            const [yyyy, mm, dd] = selectedDate.value.split("-");
            const [hour, minute] = selectedTime.value.split(":").map(n => parseInt(n, 10));

            // convert to UTC
            const dateUTC = new Date(Date.UTC(yyyy, mm - 1, dd, hour - calendarConfig.timezoneOffset, minute, 0));
            const hhUTC = String(dateUTC.getUTCHours()).padStart(2, "0");
            const mmUTC = String(dateUTC.getUTCMinutes()).padStart(2, "0");
            const ssUTC = "00";

            const startTime = `${yyyy}${mm}${dd}T${hhUTC}${mmUTC}${ssUTC}Z`;

            // add 1 hour
            const endDateUTC = new Date(dateUTC.getTime() + 60 * 60 * 1000);
            const endHH = String(endDateUTC.getUTCHours()).padStart(2, "0");
            const endMM = String(endDateUTC.getUTCMinutes()).padStart(2, "0");
            const endSS = "00";
            const endTime = `${yyyy}${mm}${dd}T${endHH}${endMM}${endSS}Z`;

            const title = encodeURIComponent(calendarConfig.title);
            const details = encodeURIComponent(calendarConfig.details);
            const email = encodeURIComponent(calendarConfig.email);

            const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&add=${email}`;
            window.open(url, "_blank");
        };


        return {
            slides,
            currentIndex,
            typedElements,
            nextSlide,
            prevSlide,
            typingFinished,
            selectedDate,
            selectedTime,
            addToGoogleCalendar
        };
    },
};
</script>
