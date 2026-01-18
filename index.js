<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BetVital - Free Football Predictions</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom scrollbar for table */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-gray-100 text-gray-800 font-sans">

    <!-- Header -->
    <nav class="bg-emerald-700 text-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" class="text-2xl font-bold tracking-tighter">BetVital</a>
            <div class="flex items-center gap-3">
                <a href="/results" class="text-xs font-bold bg-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded transition">
                    Results
                </a>
            </div>
        </div>
    </nav>

    <!-- Date Navigation (New Feature) -->
    <div class="bg-white border-b">
        <div class="container mx-auto flex justify-center text-sm font-bold text-gray-500">
            <a href="/results" class="flex-1 text-center py-3 hover:bg-gray-50 border-b-2 border-transparent hover:border-emerald-500">
                Yesterday
            </a>
            <div class="flex-1 text-center py-3 text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50">
                Today
            </div>
            <div class="flex-1 text-center py-3 hover:bg-gray-50 cursor-not-allowed opacity-50">
                Tomorrow
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto p-2 sm:p-4 max-w-4xl">
        
        <!-- Intro / SEO Text -->
        <div class="mb-4 text-center mt-2">
            <h1 class="text-lg font-bold text-gray-800">Free Football Betting Tips</h1>
            <p class="text-xs text-gray-500">Expert predictions for Premier League, La Liga & more.</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <!-- Table Header -->
            <div class="bg-gray-50 border-b px-4 py-2 flex justify-between items-center">
                <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Upcoming Matches</span>
                <span class="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Live</span>
            </div>

            <!-- Responsive Table -->
            <div class="overflow-x-auto no-scrollbar">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold">
                        <tr>
                            <th class="px-3 py-2 w-14">Time</th>
                            <th class="px-2 py-2">Match</th>
                            <th class="px-2 py-2 w-20">Tip</th>
                            <th class="px-2 py-2 text-center w-12">Conf.</th>
                            <th class="px-2 py-2 text-center w-16"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <% if(matches.length === 0) { %>
                            <tr><td colspan="5" class="p-8 text-center text-sm text-gray-500">No upcoming matches posted. Check "Results" for past games.</td></tr>
                        <% } %>

                        <% matches.forEach(match => { %>
                        <tr class="hover:bg-blue-50 transition-colors">
                            <!-- Time -->
                            <td class="px-3 py-3 text-gray-400 text-xs font-mono">
                                <%= new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) %>
                            </td>
                            
                            <!-- Match Info -->
                            <td class="px-2 py-3">
                                <div class="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-1"><%= match.league %></div>
                                <div class="text-sm font-bold text-gray-800 leading-tight">
                                    <%= match.home_team %>
                                </div>
                                <div class="text-sm font-bold text-gray-800 leading-tight">
                                    <%= match.away_team %>
                                </div>
                            </td>

                            <!-- Prediction -->
                            <td class="px-2 py-3">
                                <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                                    <%= match.prediction %>
                                </span>
                            </td>

                            <!-- Confidence -->
                            <td class="px-2 py-3 text-center">
                                <div class="relative w-8 h-8 mx-auto flex items-center justify-center">
                                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path class="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
                                        <path class="<%= match.confidence > 70 ? 'text-emerald-500' : 'text-yellow-500' %>" stroke-dasharray="<%= match.confidence %>, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3" />
                                    </svg>
                                    <span class="absolute text-[9px] font-bold text-gray-600"><%= match.confidence %></span>
                                </div>
                            </td>

                            <!-- Action Button -->
                            <td class="px-2 py-3 text-right">
                                <a href="/prediction/<%= match.slug %>" class="text-gray-400 hover:text-emerald-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </a>
                            </td>
                        </tr>
                        <% }) %>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Simple Footer -->
        <div class="mt-8 text-center border-t pt-4 pb-8">
            <a href="/admin/login" class="text-xs text-gray-300 hover:text-gray-500">Admin Login</a>
        </div>
    </div>

</body>
</html>
