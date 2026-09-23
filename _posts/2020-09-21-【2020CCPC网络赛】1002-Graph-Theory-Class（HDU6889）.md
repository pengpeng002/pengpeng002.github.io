---
title: "【2020CCPC网络赛】1002 Graph Theory Class（HDU6889）"
date: 2020-09-21 18:08:36
description: "给你一个n个结点的完全图，结点从1~n标号，结点i和j之间的边权为lcm(i+1,j+1)，问你这个图的最小生成树的边权和是多少"
tags: [HDU, 竞赛, 图论, 数学, 树]
category: "ACM"
---

# 【2020CCPC网络赛】1002 Graph Theory Class（HDU6889）

[题目链接](http://acm.hdu.edu.cn/showproblem.php?pid=6889) 

题意：给你一个n个结点的完全图，结点从1~n标号，结点i和j之间的边权为lcm\(i\+1,j\+1\)，问你这个图的最小生成树的边权和是多少

思路：为了方便起见，我们将节点从2~n\+1编号，可以知道，当新加入的节点是个质数时，最小生成树的权值之和增加的是两倍的质数值，因为把这个点和2连起来是加的值最小的，当新加入节点的值不是质数时，权值之和增加的是这个数的值，因为前面一定会存在一个数是这个数的因子，只要把这个数和它的因子连起来，增加的值就只是这个数本身的值了。

我们可以把所有质数提一个出来，则增加的数是以3为首项，公差为1的等差数列。用等差数列求和公式，O\(1\)的时间求出来这个等差数列前n项和。再用min25筛，O\( n\*\*\(3/4\) / logn\)的时间求出质数的前n项和，两项相加即可得出结果。

代码：

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef __int128 lll;
const int maxn=1e5+5;
int prime[maxn];
ll ps[maxn];
bool vis[maxn];
int cnt=1;
const int N = 1000010;
typedef long long LL;
namespace Min25
{
	int prime[N], id1[N], id2[N], flag[N], ncnt, m;
	LL g[N], sum[N], a[N], T, n;
	inline void fff()
	{
		for(int i=0; i<=N; i++)
		{
			prime[i]=0;
			id1[i]=0;
			id2[i]=0;
			flag[i]=0;
			g[i]=0;
			sum[i]=0;
			a[i]=0;
		}
		ncnt=0;
		m=0;
		T=0;
		n=0;
	}
	inline int ID(LL x)
	{
		return x <= T ? id1[x] : id2[n / x];
	}
	inline LL calc(LL x)
	{
		return x * (x + 1) / 2 - 1;
	}
	inline LL f(LL x)
	{
		return x;
	}
	inline void init()
	{
		T = sqrt(n + 0.5);
		for (int i = 2; i <= T; i++)
		{
			if (!flag[i]) prime[++ncnt] = i, sum[ncnt] = sum[ncnt - 1] + i;
			for (int j = 1; j <= ncnt && i * prime[j] <= T; j++)
			{
				flag[i * prime[j]] = 1;
				if (i % prime[j] == 0) break;
			}
		}
		for (LL l = 1; l <= n; l = n / (n / l) + 1)
		{
			a[++m] = n / l;
			if (a[m] <= T) id1[a[m]] = m;
			else id2[n / a[m]] = m;
			g[m] = calc(a[m]);
		}
		for (int i = 1; i <= ncnt; i++)
			for (int j = 1; j <= m && (LL)prime[i] * prime[i] <= a[j]; j++)
				g[j] = g[j] - (LL)prime[i] * (g[ID(a[j] / prime[i])] - sum[i - 1]);
	}
	inline LL solve(LL x)
	{
		if (x <= 1) return x;
		return n = x, init(), g[ID(n)];
	}
}
int main()
{
	int t;
	scanf("%d",&t);
	while(t--)//50
	{
		ll n,k;
		scanf("%lld%lld",&n,&k);
		Min25::fff();
		__int128 ans=(lll)(n+4)*(n-1)/2;//printf("%lld\n", (ll)ans);
		ans += Min25::solve(n+1) -2;
		ans %= k;
		printf("%lld\n", (ll)ans);
	}
}
```