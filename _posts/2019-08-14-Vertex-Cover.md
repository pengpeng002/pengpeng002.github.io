---
title: "Vertex Cover"
date: 2019-08-14 16:52:27
description: "frog has a graph with n vertices v(1),v(2),…,v(n) and m edges (v(a1),v(b1)),(v(a2),v(b2)),…,(v(am),v(bm))"
tags: [图论]
category: "ACM"
---

# Vertex Cover

frog has a graph with n vertices v\(1\),v\(2\),…,v\(n\) and m edges \(v\(a1\),v\(b1\)\),\(v\(a2\),v\(b2\)\),…,\(v\(am\),v\(bm\)\)

\.

She would like to color some vertices so that each edge has at least one colored vertex\.

Find the minimum number of colored vertices\.

### Input

The input consists of multiple tests\. For each test:

The first line contains 2

integers n,m \(2≤n≤500,1≤m≤n\(n−1\)2\)\. Each of the following m lines contains 2 integers ai,bi \(1≤ai,bi≤n,ai≠bi,min\{ai,bi\}≤30

\)

### Output

For each test, write 1

integer which denotes the minimum number of colored vertices\.

### Sample Input

```
    3 2
    1 2
    1 3
    6 5
    1 2
    1 3
    1 4
    2 5
    2 6
```

### Sample Output

```
    1
    2
```

```cpp
#include <bits/stdc++.h>
using namespace std;
const int maxn=1e5+5;
vector<int> ve[maxn];//图
int vis[maxn],match[maxn];//标记已匹配的点，匹配的结果
bool dfs(int x)
{
	for(auto u:ve[x])//尝试可以与她匹配的男孩 
	{
		if(!vis[u])//如果这个男孩没有分配
		{
			vis[u]=1;//与分配u给x 
			if(!match[u] || dfs(match[u]))
			//1.男孩u未配对，可以分配给女孩x
			//2.u已配对，dfs尝试更换他配对的女孩，让出位置给女孩x 
			{
				match[u]=x;
				match[x]=u;
				return 1;
			}
		}
	}
	return 0;
}
int main()
{
	//虽然对于最小点覆盖是如何抽象成最大匹配的还是有点勉强，但对最大匹配已经没有疑问了 
	//本题可以抽象为男女匹配 
	int n,m;
	while(scanf("%d%d",&n,&m)==2)
	{
		for(int i=0;i<=n;i++) ve[i].clear();
		memset(match,0,sizeof(match));
		for(int i=0; i<m; i++)
		{
			int x,y;//x,y互有好感
			scanf("%d%d",&x,&y);
			ve[x].push_back(y);
			ve[y].push_back(x);
		}
		int ans=0;
		for(int i=1; i<=n; i++)
		{
			if(!match[i])//为每个女孩找配对 
			{
				memset(vis,0,sizeof(vis));
				if(dfs(i))ans++;//第i个女孩配对成功，后面可能会换，但她一定能配对 
			}
		}
		printf("%d\n",ans);
	}
}
```