<template>
        <!-- [ Main Content ] start -->
        <div class="max-w-7xl mx-auto">
            <div class="pc-content">
                <!-- [ breadcrumb ] start -->
                            <div class="page-header mb-6">
                                <div class="page-block flex flex-col md:flex-row md:items-center md:justify-between">
                                    <ul class="breadcrumb flex gap-2 mt-2 md:mt-0 text-[12px]">
                                        <li class="breadcrumb-item" style="color: #616161;">
                                            <a href="#" class="hover:underline" style="color: #616161;">Home</a>
                                            <span class="mx-1" style="color: #616161;">›</span>
                                        </li>
                                        <li class="breadcrumb-item" style="color: #616161;">
                                            <a href="#" class="hover:underline" style="color: #616161;">Dashboard</a>
                                            <span class="mx-1" style="color: #616161;">›</span>
                                        </li>
                                        <li class="breadcrumb-item font-semibold" style="color: #3F4D67;" aria-current="page">Default</li>
                                    </ul>
                                </div>
                            </div>
                <!-- [ breadcrumb ] end -->

                <!-- [ Main Content ] start -->
                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12 xl:col-span-4 md:col-span-6">
                        <div class="card bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6">
                            <div class="card-header flex items-center justify-between pb-2 border-b border-gray-100">
                                <h5 class="font-semibold text-lg text-[#3F4D67]">Daily Sales</h5>
                                <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Today</span>
                            </div>
                            <div class="card-body pt-4">
                                <div class="flex items-center justify-between gap-3 flex-wrap">
                                    <h3 class="font-light flex items-center mb-0 text-2xl">
                                        <i class="feather icon-arrow-up text-green-500 text-[30px] mr-2"></i>
                                        $249.95
                                    </h3>
                                    <p class="mb-0 text-green-600 font-semibold">+67%</p>
                                </div>
                                <div class="w-full bg-gray-200 rounded-lg h-2 mt-6">
                                    <div class="bg-green-400 h-full rounded-lg shadow-[0_10px_20px_0_rgba(0,0,0,0.1)]"
                                        role="progressbar" style="width: 75%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-12 xl:col-span-4 md:col-span-6">
                        <div class="card bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6">
                            <div class="card-header flex items-center justify-between pb-2 border-b border-gray-100">
                                <h5 class="font-semibold text-lg text-[#3F4D67]">Monthly Sales</h5>
                                <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">This Month</span>
                            </div>
                            <div class="card-body pt-4">
                                <div class="flex items-center justify-between gap-3 flex-wrap">
                                    <h3 class="font-light flex items-center mb-0 text-2xl">
                                        <i class="feather icon-arrow-down text-red-500 text-[30px] mr-2"></i>
                                        $2,942.32
                                    </h3>
                                    <p class="mb-0 text-red-600 font-semibold">-36%</p>
                                </div>
                                <div class="w-full bg-gray-200 rounded-lg h-2 mt-6">
                                    <div class="bg-red-400 h-full rounded-lg shadow-[0_10px_20px_0_rgba(0,0,0,0.1)]"
                                        role="progressbar" style="width: 35%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-12 xl:col-span-4">
                        <div class="card bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6">
                            <div class="card-header flex items-center justify-between pb-2 border-b border-gray-100">
                                <h5 class="font-semibold text-lg text-[#3F4D67]">Yearly Sales</h5>
                                <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">This Year</span>
                            </div>
                            <div class="card-body pt-4">
                                <div class="flex items-center justify-between gap-3 flex-wrap">
                                    <h3 class="font-light flex items-center mb-0 text-2xl">
                                        <i class="feather icon-arrow-up text-green-500 text-[30px] mr-2"></i>
                                        $8,638.32
                                    </h3>
                                    <p class="mb-0 text-green-600 font-semibold">+80%</p>
                                </div>
                                <div class="w-full bg-gray-200 rounded-lg h-2 mt-6">
                                    <div class="bg-blue-400 h-full rounded-lg shadow-[0_10px_20px_0_rgba(0,0,0,0.1)]"
                                        role="progressbar" style="width: 80%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Thêm nội dung khác ở đây nếu cần -->
                </div>
                <!-- [ Main Content ] end -->
            </div>
        </div>
        <!-- [ Main Content ] end -->
</template>

<script>

</script>

<style scoped>
/* Hiệu ứng hover cho card */
.card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px 0 rgba(63, 77, 103, 0.12);
}
</style>