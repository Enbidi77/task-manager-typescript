# TaskPulse Platform Support Matrix

| Capability                  | Windows 10/11 (Target) | Linux                | macOS           | Notes                                       |
| --------------------------- | ---------------------- | -------------------- | --------------- | ------------------------------------------- |
| Overall CPU Utilization     | ✅ Full                | ✅ Full              | ✅ Full         | Delta calculation                           |
| Per-Core CPU Breakdown      | ✅ Full                | ✅ Full              | ✅ Full         | Logical processor grid                      |
| Physical RAM & Available    | ✅ Full                | ✅ Full              | ✅ Full         | OS-specific semantics                       |
| Pagefile / Swap             | ✅ Full                | ✅ Full              | ✅ Full         | Supported                                   |
| Virtual Memory Commit       | ✅ Full                | ⚠️ N/A               | ⚠️ N/A          | Windows Commit Charge concept               |
| Disk Volumes & Space        | ✅ Full                | ✅ Full              | ✅ Full         | Supported                                   |
| Live Disk I/O Rates         | ✅ Full                | ✅ Full              | ✅ Full         | Monotonic rate                              |
| Network Bandwidth           | ✅ Full                | ✅ Full              | ✅ Full         | Interface deltas                            |
| Process Enumeration         | ✅ Full                | ✅ Full              | ✅ Full         | Active process list                         |
| Process Termination         | ✅ Full                | ✅ Full              | ✅ Full         | `taskkill` on Windows, POSIX `kill` on Unix |
| GPU Load & VRAM             | ✅ Partial             | ✅ Partial           | ✅ Partial      | Discrete NVIDIA/AMD GPUs                    |
| Motherboard Thermal Sensors | ⚠️ Elevation required  | ⚠️ Root / lm-sensors | ⚠️ SMC required | Honest N/A when unprivileged                |
| Fan Tachometer (RPM)        | ⚠️ Driver required     | ⚠️ lm-sensors        | ⚠️ SMC required | Honest N/A when unprivileged                |

## Windows Permission Guidelines

Running `taskpulse` under a standard command prompt provides full resource monitoring of all system memory, processor utilization, volume spaces, and running processes.

Motherboard thermal sensors (such as CPU package temperature and fan tachometers) access low-level ACPI tables and WMI hardware counters that Windows restricts to Elevated (Administrator) processes.
