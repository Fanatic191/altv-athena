<template>
  <Frame minWidth="500px" maxWidth="600px">
        <template v-slot:toolbar>
            <Toolbar pageName="Scoreboard">Scoreboard - Powered by Athena</Toolbar>
            <div class="header">
            <img :src="image" class="mugshot" />
          <div class="datas">
            <ul>
              <li>
                <i class="fas fa-id-card"></i>
                Name: {{name}}
              </li>
              <li>
                <i class="fas fa-map-marked-alt"></i>
                Location: {{location}}
              </li>
            </ul>
          </div>
          <div class="counter">{{onlineplayers.length}} players online</div>
        </div>
        </template>
        <template v-slot:content>
          <table>
          <tbody>
            <td class="id">id</td>
            <td class="id">name</td>
            <td class="id">ping</td>
            <td class="id">online</td>
            <tr v-for="player in onlineplayers">
              <td class="id">{{ player.id }}</td>
              <td class="char-name">{{ player.name }}</td>
              <td class="online-time">{{ player.ping }}</td>
              <td class="online-time">{{ player.onlineTime }}</td>
            </tr>
          </tbody>
        </table>
        </template>
    </Frame>
</template>


<script setup, lang="ts">
import { defineComponent, defineAsyncComponent, PropType } from 'vue';
import WebViewEvents from '@utility/webViewEvents';


export const ComponentName = 'Scoreboard';
export default defineComponent({
    name: ComponentName,
    components: {
        Frame: defineAsyncComponent(() => import('@components/Frame.vue')),
        Toolbar: defineAsyncComponent(() => import('@components/Toolbar.vue')),
    },
    props: {
    },
    data() {
        return {
          onlineplayers: [],
          name: '',
          money: 0,
          location: '',
        };
    },

    methods: {

    },
    mounted() {
        //online players list & length
        WebViewEvents.on('updatePlayers', (players) => {
          this.onlineplayers = players;})
        //Player header, image...
        WebViewEvents.on('updateLocalPlayer', (name, money, location, image) => {
          this.name = name;
          this.money = money;
          this.location = location;
          this.image = 'data:image/png;base64,' + image;
        })
        //Ready
        WebViewEvents.emitReady(ComponentName);
      
    }
});
</script>

<style scoped>
* {
  user-select: none;
}

body {
  font-family: 'Roboto', 'Arial';
}

.main {
  width: 23em;
  height: 33em;
  background-color: rgba(0, 0, 0, 0.7);
  color: rgb(220, 220, 220);

  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

tbody {
  display: block;
  height: 26.5em;
  width: 20.5em;
  overflow-y: auto;
  overflow-x: hidden;
}

.header {
  width: 100%;
  height: 4em;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
}

.mugshot {
  height: 4em;
  width: 4em;
  filter: saturate(3) contrast(90%);
}

.datas ul {
  font-size: 0.9em;
  margin: 0 0 0 0.5em;
  padding: 0;
  list-style-type: none;
}

.counter {
  text-align: right;
  margin-left: auto;
  margin-right: 0.5em;
}

tbody {
  display: block;
  height: 28.5em;
  width: 30em;
  overflow-y: auto;
  overflow-x: hidden;
}

.id,
.online-time {
  padding: 0.1em;
  text-align: center;
  width: 8em;
}

.char-name {
  text-align: center;
  width: 15em;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
}


/* width */
::-webkit-scrollbar {
  width: 0.5em;
}

/* Track */
::-webkit-scrollbar-track {
  background: rgb(0, 0, 0, 0.5);
  border-radius: 1em;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(253, 254, 254, 0.8);
  border-radius: 1em;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgb(45, 45, 45);
}
</style>