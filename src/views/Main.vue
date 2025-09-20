<template>
    <main class="flex flex-col min-h-screen py-20 sm:py-16 md:py-20">
        <div class="container px-6 mx-auto">
            <!-- Image (hidden on final slide) -->
            <section v-if="!isFinalSlide" id="photo-header" class="max-w-3xl mx-auto text-center">
                <img :src="slideContents[currentIndex].image" alt="Slide Image"
                    class="object-cover w-56 h-auto mx-auto mb-6 rounded-lg shadow-2xl sm:mb-8" />
            </section>

            <!-- Splitter -->
            <div v-if="!isFinalSlide" class="flex justify-center splitter">
                <div class="w-20 h-1 my-5 rounded-full bg-zinc-500"></div>
            </div>

            <!-- Title -->
            <h3 class="mb-4 text-base font-semibold text-center sm:text-xl">
                {{ currentSlideData.title }}
            </h3>

            <!-- Text Box -->
            <div class="max-w-xl mx-auto">
                <div class="p-5 bg-white shadow-xl rounded-xl sm:p-6 md:p-7">
                    <div class="space-y-4 text-sm text-gray-700 sm:space-y-6 sm:text-base">
                        <p v-for="(p, index) in currentSlideData.texts" :key="index"
                            :ref="(el) => (typedElements[index] = el)"></p>
                    </div>
                </div>
            </div>

            <!-- Date Picker & Buttons (only on final slide when typing is finished) -->
            <div v-if="isFinalSlide && typingFinished"
                class="max-w-xl mx-auto mt-6 transition-all duration-1000 ease-in-out transform"
                :class="typingFinished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">

                <!-- Card container -->
                <div
                    class="p-5 space-y-3 bg-white shadow-xl rounded-xl sm:p-6 md:p-7 sm:space-y-0 sm:flex sm:items-center sm:gap-2">

                    <div class="flex w-full gap-2 text-sm sm:flex-row sm:w-auto">
                        <input type="date" v-model="selectedDate"
                            class="flex-1 p-2 border rounded hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        <input type="time" v-model="selectedTime"
                            class="flex-1 p-2 border rounded hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                    <!-- Date & Time inputs -->

                    <!-- Buttons -->
                    <div class="flex w-full gap-2 text-sm sm:flex-row sm:w-auto">
                        <button @click="addToGoogleCalendar"
                            class="flex-1 px-4 py-2 text-white transition-all duration-300 transform bg-green-600 rounded hover:bg-green-700 hover:shadow-lg hover:scale-105">
                            Lessstgooo!
                        </button>
                        <button @click="closePage"
                            class="px-4 py-2 text-white transition-all duration-300 transform bg-blue-600 rounded w-28 hover:bg-blue-700 hover:shadow-lg hover:scale-105">
                            No, Thanks
                        </button>
                    </div>
                </div>
            </div>


            <!-- Navigation Buttons -->
            <div class="flex justify-center gap-4 mt-10 sm:mt-16">
                <!-- Previous -->
                <button v-if="currentIndex > 0" @click="prevSlide" :disabled="(isSkipableSlide ? false : !typingFinished)"
                    class="inline-flex items-center justify-center w-12 text-white transition-colors duration-300 bg-gray-600 rounded-full opacity-30 aspect-square hover:bg-gray-700">
                    <i class="fas fa-chevron-left"></i>
                </button>

                <!-- Next -->
                <button v-if="currentIndex < totalSlides - 1" :disabled="(isSkipableSlide ? false : !typingFinished)"
                    @click="nextSlide" :class="[
                        'inline-flex items-center justify-center w-12 rounded-full aspect-square transition-colors duration-300',
                        typingFinished
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    ]">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>

        </div>
    </main>
</template>
<script>
import Typed from "typed.js";
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { slideContents, endSlideContent, isSkipableSlide, gCalendarConfig, closeTabText } from "../data/config";
import { postCallback } from "../helper/apiHelper";

export default {
    setup() {
        const currentIndex = ref(
            parseInt(localStorage.getItem("currentIndex")) || 0
        );
        const selectedDate = ref('');
        const selectedTime = ref(gCalendarConfig.defaultStartHour);

        const typedElements = [];
        let typedInstances = [];
        const typingFinished = ref(false);

        const totalSlides = computed(() => slideContents.length + 1);
        const isFinalSlide = computed(() => currentIndex.value === slideContents.length);

        const currentSlideData = computed(() => {
            return isFinalSlide.value ? endSlideContent : slideContents[currentIndex.value];
        });

        const runTypedSequential = async (texts, idx = 0) => {
            await nextTick();

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
            runTypedSequential(currentSlideData.value.texts);
            setToday();

            // ketika user pertama kali load halaman
            postCallback({ is_visited: 1 });
        });

        watch(currentIndex, (newIndex) => {
            localStorage.setItem("currentIndex", newIndex);
            runTypedSequential(currentSlideData.value.texts);
        });

        const nextSlide = () => {
            if (currentIndex.value < totalSlides.value - 1) currentIndex.value++;
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
        };

        const addToGoogleCalendar = () => {
            if (!selectedDate.value || !selectedTime.value) return alert("Please select date and time!");

            const [yyyy, mm, dd] = selectedDate.value.split("-");
            const [hour, minute] = selectedTime.value.split(":").map(n => parseInt(n, 10));

            const dateUTC = new Date(Date.UTC(yyyy, mm - 1, dd, hour - gCalendarConfig.timezoneOffset, minute, 0));
            const hhUTC = String(dateUTC.getUTCHours()).padStart(2, "0");
            const mmUTC = String(dateUTC.getUTCMinutes()).padStart(2, "0");
            const ssUTC = "00";

            const startTime = `${yyyy}${mm}${dd}T${hhUTC}${mmUTC}${ssUTC}Z`;

            const endDateUTC = new Date(dateUTC.getTime() + 60 * 60 * 1000);
            const endHH = String(endDateUTC.getUTCHours()).padStart(2, "0");
            const endMM = String(endDateUTC.getUTCMinutes()).padStart(2, "0");
            const endSS = "00";
            const endTime = `${yyyy}${mm}${dd}T${endHH}${endMM}${endSS}Z`;

            const title = encodeURIComponent(gCalendarConfig.title);
            const details = encodeURIComponent(gCalendarConfig.details);
            const email = encodeURIComponent(gCalendarConfig.email);

            const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&add=${email}`;
            window.open(url, "_blank");

            // callback ke backend
            postCallback({ add_to_calendar: 1 });
        };

        const closePage = () => {
            // kirim ke backend dulu
            postCallback({ no_thanks: 1 });

            window.close();
            setTimeout(() => {
                if (confirm(closeTabText)) {
                    window.location.href = "about:blank";
                }
            }, 100);
        };

        return {
            isSkipableSlide,
            slideContents,
            currentIndex,
            typedElements,
            nextSlide,
            prevSlide,
            typingFinished,
            selectedDate,
            selectedTime,
            addToGoogleCalendar,
            closePage,
            totalSlides,
            isFinalSlide,
            currentSlideData
        };
    },
};
</script>
