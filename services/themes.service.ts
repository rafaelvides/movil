import { IGetPaginatedThemes } from "@/types/ThemeTypes/themes.types"
import { API_URL } from "@/utils/constants"
import axios from "axios"

export const get_themes_paginated = (page = 1) =>{
return axios.get<IGetPaginatedThemes>(API_URL + `/theme/list-paginated?page=${page}`)
}