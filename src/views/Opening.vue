<template>
    <section class="relative flex items-center justify-center min-h-screen px-4 text-white bg-center bg-cover"
        style="background-image: url('/assets/images/bg-msg.jpg')">
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <div class="container relative mx-auto text-center">
            <h1 class="mb-4 text-3xl tracking-wide text-center sm:text-5xl md:text-6xl animate-fade-in">
                <p class="font-black">
                    {{ mainTextOpening }}
                </p>
                <p class="mt-2 text-2xl font-normal">
                    {{ miniTextOpening }}
                </p>
            </h1>

            <router-link to="/main">
                <a
                    class="inline-flex items-center justify-center w-12 text-blue-600 transition-colors duration-300 bg-white rounded-full aspect-square hover:bg-blue-50">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </router-link>
        </div>
    </section>
</template>


<script>
import { mainTextOpening, miniTextOpening } from '../data/config';

export default {
    data() {
        return {
            mainTextOpening,
            miniTextOpening,
        };
    },
};
</script>