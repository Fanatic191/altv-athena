<template>
    <div class="stack full-width">
        <h3 class="no-top">Visszaállítás</h3>
        <div class="input-group pa-4">
            <label for="seedphrase">Kulcsok</label>
            <input
                id="seedphrase"
                type="text"
                autocomplete="off"
                v-model="seedphrase"
                ref="firstFocus"
                placeholder="Must include spaces!"
            />
        </div>
        <div class="input-group mt-4 pa-4">
            <label for="password">Új jelszó</label>
            <input id="password" type="password" autocomplete="off" v-model="password" />
        </div>
        <div class="input-group mt-4 pa-4">
            <label for="password2">Jelszó ismét</label>
            <input id="password2" type="password" autocomplete="off" v-model="password2" />
        </div>
        <div class="error-group mt-6 mb-4">
            <div class="errorMessage" v-if="errorMessage">{{ errorMessage }}</div>
        </div>
        <div class="btn-group split space-between">
            <button class="btn-warning" @click="emit('select-option', 'CHOICE')">Vissza</button>
            <button class="btn-disabled" v-if="!isLoginFormValid">Ellenörzés</button>
            <button class="btn-normal" @click="submit" v-else>Hitelesítés</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { AuthEvents } from '@AthenaPlugins/basic-auth/shared/events';
import WebViewEvents from '@utility/webViewEvents';
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits<{ (e: 'select-option', selection: string): void }>();

let errorMessage = ref<string>(undefined);
let seedphrase = ref<string>('');
let password = ref<string>('');
let password2 = ref<string>('');
let firstFocus = ref(undefined);

const isLoginFormValid = computed(() => {
    errorMessage.value = '';

    if (seedphrase.value === '' && password.value === '') {
        return false;
    }

    if (seedphrase.value === '') {
        errorMessage.value = 'A kulcs érvénytelen';
        return false;
    }

    if (!seedphrase.value.includes(' ')) {
        errorMessage.value = 'Seed phrase must have spaces!';
        return false;
    }

    if (password.value === '' || password.value.length <= 3) {
        errorMessage.value = 'A jelszónak legalább 4 karakternek kell lennie.';
        return false;
    }

    if (password2.value === '' || password2.value !== password.value) {
        errorMessage.value = 'A jelszó nem egyezik.';
        return false;
    }

    return true;
});

function submit() {
    errorMessage.value = undefined;

    if (seedphrase.value === '') {
        return;
    }

    if (password.value === '' || password.value.length <= 3) {
        return;
    }

    if (password2.value === '' || password2.value !== password.value) {
        return;
    }

    WebViewEvents.emitServer(AuthEvents.toServer.tryRecovery, seedphrase.value, password.value);
}

onMounted(() => {
    if (firstFocus.value && firstFocus.value.focus) {
        firstFocus.value.focus();
    }
});
</script>

<style>
.full-width {
    width: 100%;
}
</style>
