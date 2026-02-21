export const CPU_SCHEDULING_DATA = {
    'FCFS': {
        code: `// First-Come, First-Served (FCFS)
function FCFS(processes) {
  let currentTime = 0;
  const schedule = [];
  
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  for (const process of processes) {
    if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
    }
    schedule.push({ 
        id: process.id, 
        start: currentTime, 
        duration: process.burstTime 
    });
    currentTime += process.burstTime;
  }
  return schedule;
}`,
        explanation: 'FCFS is the simplest scheduling algorithm. Processes are executed in the order they arrive in the ready queue. It is non-preemptive, meaning once a process starts, it runs to completion.',
        complexity: { time: 'O(n)', space: 'O(n)' }
    },
    'SJF': {
        code: `// Shortest Job First (SJF) - Non-Preemptive
function SJF(processes) {
    let currentTime = 0;
    const schedule = [];
    const remaining = [...processes];

    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        if (available.length === 0) {
            currentTime = Math.min(...remaining.map(p => p.arrivalTime));
            continue;
        }
        
        // Select process with shortest burst time
        available.sort((a, b) => a.burstTime - b.burstTime);
        const next = available[0];
        
        schedule.push({ 
            id: next.id, 
            start: currentTime, 
            duration: next.burstTime 
        });
        currentTime += next.burstTime;
        remaining.splice(remaining.indexOf(next), 1);
    }
    return schedule;
}`,
        explanation: 'SJF selects the waiting process with the smallest execution time to execute next. This minimizes the average waiting time for other processes.',
        complexity: { time: 'O(n²)', space: 'O(n)' }
    },
    'Round Robin': {
        code: `// Round Robin (RR)
function RoundRobin(processes, quantum) {
    let currentTime = 0;
    const queue = [];
    // ... complete logic includes queue management
    
    while (activeProcesses > 0) {
        const p = queue.shift();
        const runTime = Math.min(p.remaining, quantum);
        schedule.push({ id: p.id, start: currentTime, duration: runTime });
        
        currentTime += runTime;
        p.remaining -= runTime;
        
        // Add newly arrived processes to queue
        // Re-add current process if not finished
    }
    return schedule;
}`,
        explanation: 'Round Robin is a preemptive algorithm designed for time-sharing systems. Each process is assigned a fixed time slot (quantum). If the process is not finished within the quantum, it is preempted and added to the back of the ready queue.',
        complexity: { time: 'O(n)', space: 'O(n)' }
    }
}
