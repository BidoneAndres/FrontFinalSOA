import { defineStore } from "pinia"

export const useLayoutStore = defineStore("layout", {

    state: () => ({

        sidebar: true

    }),

    actions: {

        toggleSidebar() {

            this.sidebar = !this.sidebar

        }

    }

})